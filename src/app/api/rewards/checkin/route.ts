import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    const auth = await getCurrentUser()

    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.profile.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const lastCheckIn = user.lastCheckIn

    let canCheckIn = true
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn).toDateString()
      const today = now.toDateString()
      canCheckIn = lastDate !== today
    }

    if (!canCheckIn) {
      return NextResponse.json({ error: 'Already checked in today' }, { status: 400 })
    }

    // Determine streak (reset to 1 if more than 1 day missed)
    let newStreak = user.checkInStreak + 1
    if (lastCheckIn) {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      if (lastCheckIn.toDateString() !== yesterday.toDateString()) {
        newStreak = 1
      }
    }

    // Transaction to update user and add coin transaction
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: 10 },
          lastCheckIn: now,
          checkInStreak: newStreak,
        }
      }),
      prisma.coinTransaction.create({
        data: {
          userId: user.id,
          amount: 10,
          type: 'CHECKIN',
          description: `Daily check-in (Day ${newStreak} streak)`
        }
      })
    ])

    return NextResponse.json({
      success: true,
      coins: updatedUser.coins,
      lastCheckIn: updatedUser.lastCheckIn,
      checkInStreak: updatedUser.checkInStreak,
      transaction
    })
  } catch (error) {
    console.error('Error in daily check-in:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
