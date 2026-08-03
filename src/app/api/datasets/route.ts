import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const fileType = searchParams.get('type') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '12', 10)
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ]
    }

    if (category) {
      // Map slug back to category name
      const categoryMap: Record<string, string> = {
        'ml': 'Machine Learning',
        'machine-learning': 'Machine Learning',
        'nlp': 'NLP',
        'cv': 'Computer Vision',
        'computer-vision': 'Computer Vision',
        'finance': 'Finance & Economics',
        'finance-&-economics': 'Finance & Economics',
        'healthcare': 'Healthcare',
        'climate': 'Climate & Environment',
        'climate-&-environment': 'Climate & Environment',
        'sports': 'Sports',
        'social-science': 'Social Science',
        'social': 'Social Science',
        'other': 'Other',
      }
      const categoryName = categoryMap[category.toLowerCase()] || category
      where.category = { equals: categoryName, mode: 'insensitive' }
    }

    if (fileType) {
      where.fileType = { equals: fileType.toUpperCase() }
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'most-popular':
      case 'popular':
        orderBy = { viewCount: 'desc' }
        break
      case 'most-downloaded':
        orderBy = { downloadCount: 'desc' }
        break
      case 'most-viewed':
        orderBy = { viewCount: 'desc' }
        break
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' }
    }

    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          owner: {
            select: { username: true, name: true, avatarUrl: true }
          },
          _count: {
            select: { votes: true, comments: true }
          }
        }
      }),
      prisma.dataset.count({ where })
    ])

    // Serialize BigInt fields
    const serialized = datasets.map(d => ({
      id: d.id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      category: d.category,
      tags: d.tags,
      fileType: d.fileType,
      fileSize: d.fileSize?.toString() || '0',
      downloadCount: d.downloadCount,
      viewCount: d.viewCount,
      voteCount: d._count.votes,
      commentCount: d._count.comments,
      owner: d.owner,
      createdAt: d.createdAt.toISOString(),
    }))

    return NextResponse.json({
      datasets: serialized,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching datasets:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
