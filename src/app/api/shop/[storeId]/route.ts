import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

export async function GET(request: Request, { params }: { params: { storeId: string } }) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const sortBy = searchParams.get('sortBy')
  const page = parseInt(searchParams.get('page') || '1')
  
  try {
    const store = await prisma.businessProfile.findUnique({
      where: { organizationId: params.storeId },
      include: {
        organization: true,
        products: {
          where: {
            ...(category && { categories: { contains: category } })
          },
          orderBy: {
            ...(sortBy === 'price' && { price: 'asc' }),
            ...(sortBy === 'rating' && { averageRating: 'desc' })
          },
          take: 20,
          skip: (page - 1) * 20
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Failed to fetch store' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request, { params }: { params: { storeId: string } }) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const store = await prisma.businessProfile.findUnique({
      where: { organizationId: params.storeId }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      )
    }

    // Add customer to store's active customers
    await prisma.customer.update({
      where: { userId },
      data: {
        lastVisitedStore: params.storeId,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating customer store:', error)
    return NextResponse.json(
      { error: 'Failed to update customer store' },
      { status: 500 }
    )
  }
}
