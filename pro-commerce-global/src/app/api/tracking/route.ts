
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.json({ error: 'Tracking code is required' }, { status: 400 })
    }

    try {
        const order = await prisma.order.findUnique({
            where: {
                trackingCode: code
            },
            include: {
                events: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                items: {
                    include: {
                        product: true
                    }
                },
                user: {
                    select: {
                        country: true,
                        city: true
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Fetch route info based on user country or default
        const country = order.user.country || 'Angola'

        // Try to find specific route or use default logic
        const route = await prisma.deliveryRoute.findFirst({
            where: {
                OR: [
                    { countryName: country },
                    { countryCode: country } // In case country is stored as code
                ]
            }
        }) || {
            // Default Fallback
            carrier: "ProCommerce Logistics",
            baseDays: 3,
            maxDays: 7,
            countryName: country
        }

        return NextResponse.json({
            trackingCode: order.trackingCode,
            status: order.status,
            estimatedDelivery: order.estimatedDeliveryDate,
            events: order.events,
            route: route,
            destination: {
                city: order.user.city,
                country: country
            },
            items: order.items.map(i => ({
                name: i.product.name,
                image: i.product.images
            }))
        })

    } catch (error) {
        console.error('Tracking Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
