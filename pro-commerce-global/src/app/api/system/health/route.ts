import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const session = await auth()

        // Only admin can access
        const user = session?.user?.email ? await prisma.user.findUnique({
            where: { email: session.user.email }
        }) : null

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Check ENV variables
        const envChecks = {
            database: !!process.env.DATABASE_URL,
            nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
            nextAuthUrl: !!process.env.NEXTAUTH_URL,
            stripeSecret: !!process.env.STRIPE_SECRET_KEY,
            stripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
            stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
            resendApi: !!process.env.RESEND_API_KEY,
            baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL
        }

        // Check database connection
        let dbStatus = 'disconnected'
        let dbError = null
        try {
            // Use a simple lightweight query instead of raw SQL to avoid BigInt issues
            await prisma.user.findFirst({ select: { id: true } })
            dbStatus = 'connected'
        } catch (e: any) {
            console.error("HEALTH CHECK DB ERROR:", e)
            dbError = e.message || "Unknown DB Error"
        }

        // Check system config
        let systemConfig = null
        try {
            systemConfig = await prisma.systemConfig.findUnique({
                where: { id: 'global' }
            })
        } catch (e) {
            // Config doesn't exist yet
        }

        // Count critical data
        const stats = {
            users: await prisma.user.count(),
            stores: await prisma.store.count(),
            products: await prisma.product.count(),
            orders: await prisma.order.count(),
            wallets: await prisma.wallet.count(),
            transactions: await prisma.transaction.count()
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: {
                node: process.version,
                platform: process.platform
            },
            database: {
                status: dbStatus,
                error: dbError
            },
            envVariables: envChecks,
            systemConfig: systemConfig ? {
                platformFee: systemConfig.platformFeePercent,
                registrationFee: systemConfig.vendorRegistrationFee
            } : 'not_initialized',
            stats
        })

    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                message: error.message
            },
            { status: 500 }
        )
    }
}
