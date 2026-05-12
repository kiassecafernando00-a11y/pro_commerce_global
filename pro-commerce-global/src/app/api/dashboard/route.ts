import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Get Store for current User
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) {
            return NextResponse.json({
                totalSales: 0,
                totalOrders: 0,
                totalProducts: 0,
                recentOrders: []
            })
        }

        // 1. Total Products
        const totalProducts = await prisma.product.count({
            where: { storeId: store.id }
        })

        // 2. Orders & Sales (Complex because Order is overarching, but Items belong to Store)
        // We find OrderItems related to this store
        const orderItems = await prisma.orderItem.findMany({
            where: {
                product: {
                    storeId: store.id
                }
            },
            include: {
                order: {
                    include: { user: true }
                }
            },
            orderBy: { order: { createdAt: 'desc' } }
        })

        // Calculate Totals derived from Items
        const totalSales = orderItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0)

        // Unique orders count
        const uniqueOrderIds = new Set(orderItems.map(item => item.orderId))
        const totalOrders = uniqueOrderIds.size

        // Recent Orders (Deduped)
        const recentOrdersMap = new Map()
        orderItems.forEach(item => {
            if (!recentOrdersMap.has(item.orderId)) {
                recentOrdersMap.set(item.orderId, {
                    id: item.order.id,
                    customer: item.order.user?.name || "Cliente",
                    date: item.order.createdAt,
                    status: item.order.status,
                    total: Number(item.price) * item.quantity // Showing only THIS vendor's share of the total
                })
            } else {
                const existing = recentOrdersMap.get(item.orderId)
                existing.total += Number(item.price) * item.quantity
            }
        })

        const recentOrders = Array.from(recentOrdersMap.values()).slice(0, 5)

        return NextResponse.json({
            totalSales,
            totalOrders,
            totalProducts,
            recentOrders
        })

    } catch (error) {
        console.error("[DASHBOARD_STATS_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
