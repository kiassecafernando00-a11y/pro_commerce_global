import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { items, total: clientTotal, deliveryMethod, address, paymentMethod } = await req.json()

        if (!items || items.length === 0) {
            return new NextResponse("No items in cart", { status: 400 })
        }

        // Server-side calculation to be safe
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)

        let deliveryFee = 0
        if (deliveryMethod === 'DELIVERY') {
            deliveryFee = 2000 // Fixed fee as per plan
        }

        const finalTotal = itemsTotal + deliveryFee

        // Create Order
        const order = await prisma.order.create({
            data: {
                userId: session.user.id,
                total: finalTotal,
                deliveryFee: deliveryFee,
                deliveryMethod: deliveryMethod || 'PICKUP',
                paymentMethod: paymentMethod || 'MANUAL',
                address: address ? JSON.stringify(address) : null,
                status: "PENDING",
                trackingCode: `TRK-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).toUpperCase().slice(2, 4)}`,
                events: {
                    create: {
                        status: "PEDIDO_RECEBIDO",
                        description: "Pedido recebido com sucesso.",
                        location: "Sistema Central"
                    }
                },
                // Create OrderItems
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        // SECURITY AUDIT LOG
        const { AuditService } = await import("@/services/audit")
        await AuditService.log({
            action: "ORDER_CREATED",
            actorEmail: session.user.email,
            actorId: session.user.id,
            entityId: order.id,
            entityType: "ORDER",
            details: `Novo pedido #${order.id} criado. Total: ${finalTotal}`,
            metadata: { total: finalTotal, paymentMethod },
            severity: "LOW"
        })

        return NextResponse.json({ success: true, orderId: order.id })
    } catch (error) {
        console.error("[CHECKOUT_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
