import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const stores = await prisma.store.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ stores })

    } catch (error) {
        console.error("[ADMIN_STORES_GET]", error)
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
        const { storeId, status } = body

        if (!storeId || !status) {
            return new NextResponse("Missing data", { status: 400 })
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { status }
        })

        // Se a loja for aprovada, garantir que o usuário é VENDOR
        if (status === "APPROVED") {
            await prisma.user.update({
                where: { id: store.userId },
                data: { role: "VENDOR" }
            })
        }

        return NextResponse.json(store)

    } catch (error) {
        console.error("[ADMIN_STORES_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return new NextResponse("Missing ID", { status: 400 })
        }

        await prisma.store.delete({
            where: { id }
        })

        return new NextResponse("Deleted", { status: 200 })

    } catch (error) {
        console.error("[ADMIN_STORES_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
