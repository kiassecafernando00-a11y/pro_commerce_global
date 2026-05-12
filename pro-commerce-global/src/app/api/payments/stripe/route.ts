import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

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
        const { items, deliveryFee, address, deliveryMethod } = body

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Carrinho vazio" },
                { status: 400 }
            )
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json(
                { error: "Usuário não encontrado" },
                { status: 404 }
            )
        }

        // Calculate total
        const subtotal = items.reduce((sum: number, item: any) =>
            sum + (Number(item.price) * item.quantity), 0
        )
        const total = subtotal + (deliveryFee || 0)

        // Get or create Stripe customer
        const customerId = await getOrCreateStripeCustomer(
            user.id,
            session.user.email,
            user.name || undefined
        )

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'payment',
            client_reference_id: body.orderId, // Link session to our Order ID
            payment_method_types: ['card'],
            line_items: items.map((item: any) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name || `Product ${item.productId}`,
                    },
                    unit_amount: Math.round(Number(item.price) * 100),
                },
                quantity: item.quantity,
            })),
            // Add delivery fee if exists
            ...(deliveryFee > 0 ? {
                shipping_options: [{
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: Math.round(deliveryFee * 100),
                            currency: 'usd',
                        },
                        display_name: deliveryMethod === 'DELIVERY' ? 'Entrega' : 'Recolha',
                    }
                }]
            } : {}),
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancelled`,
            metadata: {
                userId: user.id,
                items: JSON.stringify(items.map((i: any) => ({ productId: i.productId, quantity: i.quantity, storeId: i.storeId }))),
                address: JSON.stringify(address),
                deliveryMethod: deliveryMethod || 'DELIVERY',
                deliveryFee: String(deliveryFee || 0)
            }
        })

        return NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url
        })

    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: error.message || "Erro ao processar pagamento" },
            { status: 500 }
        )
    }
}
