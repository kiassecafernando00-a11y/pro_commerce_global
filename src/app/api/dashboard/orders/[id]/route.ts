import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { status } = await req.json()

        // Validate status
        const validStatuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]
        if (!validStatuses.includes(status)) {
            return new NextResponse("Invalid status", { status: 400 })
        }

        // Verify that the order contains items from this vendor
        // We do this by checking if the vendor has a store, and if the order has items from that store.
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { items: { include: { product: true } } }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        // Check if this vendor owns any item in this order
        const hasVendorItems = order.items.some(item => item.product.storeId === store.id)

        if (!hasVendorItems) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // Generate Tracking Code if SHIPPED and not present
        let trackingUpdates = {}
        if (status === "SHIPPED" && !order.trackingCode) {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0")
            trackingUpdates = {
                trackingCode: `TRK-${dateStr}-${randomSuffix}`
            }
        }

        // Update Order Status
        const updatedOrder = await prisma.order.update({
            where: { id: params.id },
            data: {
                status,
                ...trackingUpdates
            }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("[ORDER_UPDATE_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
