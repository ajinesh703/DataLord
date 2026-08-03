import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

const MAX_SIZE_MB = 10
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser()

    if (!auth || !auth.profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check Content-Length header if present
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum upload size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      )
    }

    const { title, description, category, tags, license, fileSize } = await request.json()

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file size if provided by client
    if (fileSize && fileSize > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum upload size is ${MAX_SIZE_MB}MB.` },
        { status: 413 }
      )
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    // Create dataset and award 100 coins in transaction
    const [dataset, updatedUser, transaction] = await prisma.$transaction([
      prisma.dataset.create({
        data: {
          ownerId: auth.profile.id,
          title,
          slug,
          description,
          category,
          tags: tags || [],
          license: license || 'MIT',
          fileUrl: '/mock-files/sample.csv',
          fileSize: BigInt(fileSize || 1024 * 1024),
          fileType: 'CSV'
        }
      }),
      prisma.user.update({
        where: { id: auth.profile.id },
        data: {
          coins: { increment: 100 }
        }
      }),
      prisma.coinTransaction.create({
        data: {
          userId: auth.profile.id,
          amount: 100,
          type: 'UPLOAD',
          description: `Uploaded dataset: ${title}`
        }
      })
    ])

    return NextResponse.json({
      success: true,
      dataset: { ...dataset, fileSize: dataset.fileSize?.toString() },
      coins: updatedUser.coins,
      transaction
    })
  } catch (error) {
    console.error('Error uploading dataset:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

