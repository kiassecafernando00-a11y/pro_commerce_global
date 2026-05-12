import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 })

    const body = await req.json()
    const { proofUrl } = body

    if (!proofUrl) return new NextResponse("Missing proof", { status: 400 })

    // Update Store
    await prisma.store.update({
        where: { userId: session.user.id },
        data: {
            registrationFeeProof: proofUrl,
            registrationFeeStatus: "PENDING_REVIEW" // Or just PENDING, but lets mark as review needed if possible.
            // My schema has PENDING, PAID, EXEMPT. 
            // PENDING implies checks needed. 
            // Let's keep it PENDING but the presence of proofUrl indicates review needed.
        }
    })

    return NextResponse.json({ success: true })
}
