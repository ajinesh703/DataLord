import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const auth = await getCurrentUser()

    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.profile.id },
      include: {
        coinTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        redemptions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      coins: user.coins,
      lastCheckIn: user.lastCheckIn,
      checkInStreak: user.checkInStreak,
      transactions: user.coinTransactions,
      redemptions: user.redemptions
    })
  } catch (error) {
    console.error('Error fetching user rewards:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
