import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser()

    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rewardId, rewardName, coinsSpent } = await request.json()

    if (!rewardId || !rewardName || !coinsSpent || coinsSpent <= 0) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.profile.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.coins < coinsSpent) {
      return NextResponse.json({ error: 'Insufficient coins' }, { status: 400 })
    }

    const [updatedUser, redemption, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { decrement: coinsSpent }
        }
      }),
      prisma.redemption.create({
        data: {
          userId: user.id,
          rewardId,
          rewardName,
          coinsSpent,
          status: 'completed'
        }
      }),
      prisma.coinTransaction.create({
        data: {
          userId: user.id,
          amount: -coinsSpent,
          type: 'REDEMPTION',
          description: `Redeemed ${rewardName}`
        }
      })
    ])

    return NextResponse.json({
      success: true,
      coins: updatedUser.coins,
      redemption,
      transaction
    })
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
