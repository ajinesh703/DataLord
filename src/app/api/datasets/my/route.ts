import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const auth = await getCurrentUser()

    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const datasets = await prisma.dataset.findMany({
      where: { ownerId: auth.profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    })

    const serialized = datasets.map(d => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      fileType: d.fileType,
      downloadCount: d.downloadCount,
      viewCount: d.viewCount,
      voteCount: d._count.votes,
      createdAt: d.createdAt.toISOString(),
    }))

    return NextResponse.json({ datasets: serialized })
  } catch (error) {
    console.error('Error fetching user datasets:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
