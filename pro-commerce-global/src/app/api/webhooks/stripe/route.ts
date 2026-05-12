import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { OrderFinancialService } from "@/services/financial/order-financial.service"
import Stripe from "stripe"

// This is important for webhook handling
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature' },
            { status: 400 }
        )
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message)
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        )
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session

                // Create order from session metadata
                const metadata = session.metadata
                if (!metadata?.userId || !metadata?.items) {
                    console.error('Missing metadata in session')
                    break
                }

                const items = JSON.parse(metadata.items)
                const address = JSON.parse(metadata.address || '{}')

                // Get user
                const user = await prisma.user.findUnique({
                    where: { id: metadata.userId }
                })

                if (!user) {
                    console.error('User not found')
                    break
                }

                // Fetch product details for each item
                const enrichedItems = await Promise.all(
                    items.map(async (item: any) => {
                        const product = await prisma.product.findUnique({
                            where: { id: item.productId }
                        })
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: product?.price || 0,
                            storeId: item.storeId || product?.storeId
                        }
                    })
                )

                // Calculate total
                const subtotal = enrichedItems.reduce((sum, item) =>
                    sum + (Number(item.price) * item.quantity), 0
                )
                const deliveryFee = Number(metadata.deliveryFee || 0)
                const total = subtotal + deliveryFee

                // Create tracking code
                const trackingCode = `TR${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`

                // Create order
                const order = await prisma.order.create({
                    data: {
                        userId: user.id,
                        total,
                        deliveryFee,
                        deliveryMethod: metadata.deliveryMethod || 'DELIVERY',
                        currency: 'USD', // From Stripe
                        paymentMethod: 'STRIPE',
                        address: metadata.address,
                        status: 'PAID', // Immediate as payment is confirmed
                        trackingCode,
                        items: {
                            create: enrichedItems.map(item => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        },
                        events: {
                            create: {
                                status: 'PAID',
                                description: 'Pagamento confirmado via Stripe',
                                location: 'Sistema de Pagamento'
                            }
                        },
                        transactions: {
                            create: {
                                type: 'SALE',
                                amount: total,
                                currency: 'USD',
                                status: 'COMPLETED',
                                description: `Pagamento Stripe - Session ${session.id}`,
                                reference: session.payment_intent as string,
                                gateway: 'STRIPE'
                            }
                        }
                    }
                })

                // Process financial transactions (credit wallets, deduct commission)
                await OrderFinancialService.processOrderPayment(order.id)

                // Update product stock
                for (const item of enrichedItems) {
                    await prisma.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } }
                    })
                }

                break
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object
                console.error('Payment failed:', paymentIntent.id)
                // You could save this to database for tracking failed payments
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
