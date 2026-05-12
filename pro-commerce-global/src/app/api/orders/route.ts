import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { sendOrderConfirmationEmail } from "@/lib/email"
import { OrderFinancialService } from "@/services/financial/order-financial.service"

export async function POST(req: NextRequest) {
    try {
        const session = await auth()


        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { items, total, address, deliveryFee } = body

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Carrinho vazio" },
                { status: 400 }
            )
        }

        // Buscar usuário
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        // Determine initial status based on payment method and reference
        let orderStatus = "PENDING"
        let transactionStatus = "PENDING"
        const reference = body.reference || null

        if (body.paymentMethod === "VISA" || body.paymentMethod === "MASTERCARD") {
            if (reference) {
                orderStatus = "PAID"
                transactionStatus = "COMPLETED"
            }
        }

        // 1. Get System Configuration for Commission
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "global" } })
        const platformFeePercent = Number(systemConfig?.platformFeePercent || 5)

        // 2. Criar pedido (Order Parent) with Tracking Code
        const trackingCode = `TRK - ${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).toUpperCase().slice(2, 4)} `

        const order = await prisma.order.create({
            data: {
                userId: user.id,
                total: total,
                deliveryMethod: body.deliveryMethod || "DELIVERY", // DELIVERY, PICKUP
                currency: body.currency || "AOA",
                paymentMethod: body.paymentMethod || "MANUAL",
                address: JSON.stringify(body.address),
                deliveryFee: deliveryFee || 0,
                latitude: body.latitude,
                longitude: body.longitude,
                status: orderStatus,
                trackingCode: trackingCode,
                events: {
                    create: {
                        status: "PEDIDO_RECEBIDO",
                        description: "Pedido recebido e aguardando confirmação.",
                        location: "Sistema Central"
                    }
                },
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        })

        // ** NEW: Process financial transactions using OrderFinancialService **
        // This handles wallet credits, commission deduction, and transaction recording
        if (orderStatus === 'PAID') {
            await OrderFinancialService.processOrderPayment(order.id)
        }

        // 4. Update Stock
        for (const item of items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            })
        }

        // --- EMAIL NOTIFICATION ---
        try {
            // Recalculate formatted items for email
            // We need product names, which we might not have fully in 'items' input if it only had IDs.
            // However, the checkout payload usually has recent details or we can re-query.
            // But wait, the `prisma.order.create` above used `items` from body directly.
            // In a robust system, we should query DB to get names.
            // For now, let's assume `items` in body contains names or we query.
            // Looking at checkout, `items` in body has `productId`, `quantity`, `price`. Name is missing in the body sent to API (see line 125 of checkout/page.tsx).
            // We must fetch names or rely on the frontend passing them (frontend has them).
            // Let's rely on quick DB query since we just inserted them? No, `prisma.order.create` doesn't return the related products automatically unless we include.

            // Let's refactor the create to include the created items with product details?
            // Actually, easier: Update the checkout to send names? No, API responsbility.

            // Quick fix: fetch the order with items included to send email.
            const orderWithDetails = await prisma.order.findUnique({
                where: { id: order.id },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            })

            if (orderWithDetails && user.email) {
                const emailItems = orderWithDetails.items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity,
                    price: Number(item.price)
                }))

                // Send async - don't await strictly if you want speed, but Vercel serverless might kill it.
                // Best to await or use `waitUntil`. Next.js 15+ has `after`. This is Next 16 per package.json?
                // package.json says "next": "16.0.10". 'after' is experimental or stable?
                // Let's just await for safety for now.
                // Wait, the signature I wrote is (to, orderId, total, items, address).
                // Address in order is a JSON string. I should parse it or format it.
                // Let's parse it back.

                const savedAddress = JSON.parse(order.address as string)
                const addressStr = `${savedAddress.street}, ${savedAddress.city}, ${savedAddress.province} `

                await sendOrderConfirmationEmail(
                    user.email,
                    order.id,
                    Number(order.total) + Number(order.deliveryFee),
                    emailItems,
                    addressStr
                )
            }

        } catch (e) {
            console.error("Email trigger failed", e)
        }

        return NextResponse.json({ success: true, orderId: order.id })

    } catch (error) {
        console.error("Erro ao processar pedido:", error)
        return NextResponse.json(
            { error: "Erro interno no servidor" },
            { status: 500 }
        )
    }
}
