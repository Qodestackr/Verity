import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const latitude = searchParams.get('lat')
  const longitude = searchParams.get('lng')
  const category = searchParams.get('category')
  const sortBy = searchParams.get('sortBy')
  const page = parseInt(searchParams.get('page') || '1')
  
  try {
    const stores = await prisma.businessProfile.findMany({
      where: {
        ...(category && { shopCategory: category }),
        isOnlineShop: true,
        isLive: true
      },
      include: {
        organization: true
      },
      orderBy: {
        ...(sortBy === 'rating' && { averageRating: 'desc' }),
        ...(sortBy === 'distance' && { 
          deliveryAreas: {
            _count: 'desc'
          }
        })
      },
      take: 20,
      skip: (page - 1) * 20
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const { storeId } = await request.json()
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const favorite = await prisma.customer.update({
      where: { userId },
      data: {
        favoriteStores: {
          ...(storeId ? { push: storeId } : { set: [] })
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating favorite store:', error)
    return NextResponse.json(
      { error: 'Failed to update favorite store' },
      { status: 500 }
    )
  }
}
