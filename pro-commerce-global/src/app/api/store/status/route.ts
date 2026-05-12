import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 })

    // Get System Config
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } })

    // Get Store Status
    const store = await prisma.store.findUnique({
        where: { userId: session.user.id },
        select: { registrationFeeStatus: true }
    })

    return NextResponse.json({
        fee: config?.vendorRegistrationFee || 5000,
        adminPaymentInfo: config?.adminPaymentInfo || null,
        adminReference: "ProCommerce Global",
        store
    })
}
