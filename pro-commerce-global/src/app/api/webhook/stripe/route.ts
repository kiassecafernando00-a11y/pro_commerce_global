import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import Stripe from "stripe"

export async function POST(req: Request) {
    const body = await req.text()
    const signature = (await headers()).get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session

    if (event.type === "checkout.session.completed") {
        const orderId = session.client_reference_id

        if (orderId) {
            // Update Order
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: "PAID",
                    events: {
                        create: {
                            status: "PAGAMENTO_CONFIRMADO",
                            description: "Pagamento recebido via Stripe.",
                            location: "Stripe"
                        }
                    }
                }
            })

            // Generate Transaction Record (Mirroring the payment)
            // Note: Our immutability middleware handles hash generation
            try {
                // Find order to get total amount if needed, or use session amount
                const amount = session.amount_total ? session.amount_total / 100 : 0

                // We likely need a wallet or just record it. 
                // For now, let's just update the order status as critical.

                // Log Audit
                const { AuditService } = await import("@/services/audit")
                await AuditService.log({
                    action: "PAYMENT_RECEIVED_STRIPE",
                    actorId: "STRIPE_WEBHOOK", // System actor
                    entityId: orderId,
                    entityType: "ORDER",
                    details: `Pagamento de ${amount} recebido via Stripe.`,
                    severity: "HIGH"
                })

            } catch (e) {
                console.error("Error creating transaction record for stripe payment", e)
            }
        }
    }

    return new NextResponse(null, { status: 200 })
}
