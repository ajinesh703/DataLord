import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const [totalDatasets, totalUsers, totalDownloads] = await Promise.all([
      prisma.dataset.count(),
      prisma.user.count(),
      prisma.download.count(),
    ])

    // Get category counts
    const categoryCounts = await prisma.dataset.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    const categoryMap: Record<string, number> = {}
    categoryCounts.forEach(c => {
      categoryMap[c.category] = c._count.id
    })

    return NextResponse.json({
      totalDatasets,
      totalUsers,
      totalDownloads,
      categoryCounts: categoryMap,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
