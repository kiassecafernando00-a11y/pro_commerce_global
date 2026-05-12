import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // 1. Total Users
        const totalUsers = await prisma.user.count()

        // 2. Total Orders
        const totalOrders = await prisma.order.count()

        // 3. Total Products
        const totalProducts = await prisma.product.count()

        // 4. Total Revenue (Sum of all orders)
        // Note: In a real app, you might want to filter only "PAID" orders
        const orders = await prisma.order.findMany({
            select: { total: true }
        })
        const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total), 0)

        return NextResponse.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue
        })

    } catch (error) {
        console.error("[ADMIN_STATS_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
