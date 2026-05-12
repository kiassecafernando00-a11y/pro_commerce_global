import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const store = await prisma.store.findUnique({
            where: { userId: session.user.id },
            select: { paymentInfo: true, status: true, bankAccounts: true }
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        return NextResponse.json(store)

    } catch (error) {
        console.error("[VENDOR_SETTINGS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { paymentInfo } = body

        const store = await prisma.store.update({
            where: { userId: session.user.id },
            data: { paymentInfo }
        })

        return NextResponse.json(store)

    } catch (error) {
        console.error("[VENDOR_SETTINGS_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
