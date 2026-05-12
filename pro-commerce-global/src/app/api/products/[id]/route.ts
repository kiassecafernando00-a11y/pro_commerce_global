import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const product = await prisma.product.findUnique({
            where: {
                id: params.id,
            },
            include: {
                store: {
                    select: {
                        name: true,
                        id: true,
                        description: true,
                    }
                }
            }
        })

        if (!product) {
            return new NextResponse("Product not found", { status: 404 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("[PRODUCT_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        const resolvedParams = await params

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const store = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        // Verify product belongs to store
        const existingProduct = await prisma.product.findUnique({
            where: {
                id: resolvedParams.id,
                storeId: store.id, // Security check
            },
        })

        if (!existingProduct) {
            return new NextResponse("Product not found or unauthorized", { status: 404 })
        }

        const body = await req.json()
        const { name, description, price, stock, images } = body

        const product = await prisma.product.update({
            where: {
                id: resolvedParams.id,
            },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                images,
            },
        })

        return NextResponse.json(product)
    } catch (error) {
        console.error("[PRODUCT_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        const resolvedParams = await params

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const store = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        // Verify product belongs to store
        const existingProduct = await prisma.product.findUnique({
            where: {
                id: resolvedParams.id,
                storeId: store.id, // Security check
            },
        })

        if (!existingProduct) {
            return new NextResponse("Product not found or unauthorized", { status: 404 })
        }

        await prisma.product.delete({
            where: {
                id: resolvedParams.id,
            },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[PRODUCT_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
