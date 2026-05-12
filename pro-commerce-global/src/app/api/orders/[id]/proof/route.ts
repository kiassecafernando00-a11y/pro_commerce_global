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
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { proofUrl } = await req.json()
        if (!proofUrl) {
            return new NextResponse("Proof URL required", { status: 400 })
        }

        // Verify order ownership
        const order = await prisma.order.findUnique({
            where: { id: params.id },
        })

        if (!order || order.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const updatedOrder = await prisma.order.update({
            where: { id: params.id },
            data: { proofUrl, updatedAt: new Date() }
        })

        return NextResponse.json(updatedOrder)
    } catch (error) {
        console.error("[ORDER_PROOF_UPDATE]", error)
        const errorMessage = error instanceof Error ? error.message : "Internal Error"
        return new NextResponse(errorMessage, { status: 500 })
    }
}
