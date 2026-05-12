import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Haversine Formula for Distance Calculation (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { userLocation, items } = body // items: { storeId, quantity }[]

        if (!userLocation?.lat || !userLocation?.lng || !items || items.length === 0) {
            return NextResponse.json({ fee: 0, details: [] })
        }

        // 1. Group items by Store
        const uniqueStoreIds = [...new Set(items.map((item: any) => item.storeId))] as string[]

        // 2. Fetch Stores with Location Settings
        const stores = await prisma.store.findMany({
            where: { id: { in: uniqueStoreIds } },
            select: {
                id: true,
                latitude: true,
                longitude: true,
                deliveryBaseFee: true,
                deliveryPricePerKm: true
            }
        })

        let totalFee = 0
        const details = []

        for (const store of stores) {
            let storeFee = 0
            let distance = 0

            // Check if store has valid location config
            if (store.latitude && store.longitude && store.deliveryPricePerKm) {
                distance = calculateDistance(
                    store.latitude,
                    store.longitude,
                    userLocation.lat,
                    userLocation.lng
                )

                // Fee = Base + (Distance * Rate)
                // Using Number() to handle Decimal types from Prisma
                const base = Number(store.deliveryBaseFee) || 0
                const rate = Number(store.deliveryPricePerKm) || 0

                storeFee = base + (distance * rate)
            } else {
                // Fallback if no location set: Use Base Fee or 0
                storeFee = Number(store.deliveryBaseFee) || 0
            }

            // Round to nearest reasonable value (e.g., 10 AOA) or just 2 decimals
            storeFee = Math.ceil(storeFee)

            totalFee += storeFee
            details.push({
                storeId: store.id,
                distanceKm: distance.toFixed(2),
                fee: storeFee
            })
        }

        return NextResponse.json({
            totalFee,
            currency: 'AOA',
            details
        })

    } catch (error) {
        console.error("[DELIVERY_CALC]", error)
        return NextResponse.json({ error: "Failed to calculate delivery" }, { status: 500 })
    }
}
