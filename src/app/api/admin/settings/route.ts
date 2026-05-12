import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        // Allow ADMIN or VENDOR to read settings (Vendor needs it to pay registration fee)
        if (!session?.user?.role) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const settings = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        })

        return NextResponse.json(settings || {})

    } catch (error) {
        console.error("[SETTINGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { adminPaymentInfo } = body

        const settings = await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: {
                adminPaymentInfo
            },
            create: {
                id: "global",
                adminPaymentInfo
            }
        })

        return NextResponse.json(settings)

    } catch (error) {
        console.error("[SETTINGS_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
