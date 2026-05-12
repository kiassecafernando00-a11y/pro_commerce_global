import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
})

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string) {
    const { prisma } = await import('@/lib/prisma')

    const user = await prisma.user.findUnique({
        where: { id: userId }
    })

    if (user?.stripeCustomerId) {
        return user.stripeCustomerId
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
        email,
        name: name || undefined,
        metadata: {
            userId
        }
    })

    // Save to database
    await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customer.id }
    })

    return customer.id
}

/**
 * Create a payment intent for an order
 */
export async function createPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, string>) {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe uses cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    })
}
