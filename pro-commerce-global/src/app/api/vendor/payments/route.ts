import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        const { amount, description, proofUrl } = await req.json()

        if (!amount || !proofUrl) {
            return new NextResponse("Amount and Proof URL required", { status: 400 })
        }

        const transaction = await prisma.transaction.create({
            data: {
                type: "COMMISSION_PAYMENT",
                amount: parseFloat(amount),
                currency: "AOA",
                status: "PENDING",
                description: description || "Pagamento de Taxa/Comissão",
                proofUrl,
                storeId: store.id,
                userId: session.user.id,
                gateway: "MANUAL"
            }
        })

        return NextResponse.json(transaction)
    } catch (error) {
        console.error("[VENDOR_PAYMENT_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
