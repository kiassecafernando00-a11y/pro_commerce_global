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

        const products = await prisma.product.findMany({
            include: {
                store: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return NextResponse.json({ products })

    } catch (error) {
        console.error("[ADMIN_PRODUCTS_GET]", error)
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
        const { productId, status } = body

        if (!productId || !status) {
            return new NextResponse("Missing data", { status: 400 })
        }

        const product = await prisma.product.update({
            where: { id: productId },
            data: { status }
        })

        return NextResponse.json(product)

    } catch (error) {
        console.error("[ADMIN_PRODUCTS_PUT]", error)
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

        await prisma.product.delete({
            where: { id }
        })

        return new NextResponse("Deleted", { status: 200 })

    } catch (error) {
        console.error("[ADMIN_PRODUCTS_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
