import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
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

        // Buscar itens de pedidos que pertencem a produtos desta loja
        // Prisma não permite buscar OrderItems diretamente filtrando por product.storeId facilmente em query profunda inversa sem include
        // Mas podemos buscar OrderItems onde Product.storeId = store.id
        const sales = await prisma.orderItem.findMany({
            where: {
                product: {
                    storeId: store.id
                }
            },
            include: {
                product: {
                    select: {
                        name: true,
                        images: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                        address: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                order: {
                    createdAt: 'desc'
                }
            }
        })

        return NextResponse.json(sales)
    } catch (error) {
        console.error("[VENDOR_Sales_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
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

        const body = await req.json()
        const { orderId, status } = body

        if (!orderId || !status) {
            return new NextResponse("Missing data", { status: 400 })
        }

        // Simplificação: O vendedor atualiza o status de todo o pedido
        // Idealmente, verificariamos se todos os itens pertencem à loja ou teríamos status por item.
        // Para MVP, assumimos confiança ou sistema de marketplaces menores onde raramente há mix complexo.

        // Vamos verificar se o pedido tem itens desta loja antes de permitir update
        const orderHasStoreItems = await prisma.orderItem.findFirst({
            where: {
                orderId: orderId,
                product: {
                    storeId: store.id
                }
            }
        })

        if (!orderHasStoreItems) {
            return new NextResponse("Unauthorized for this order", { status: 403 })
        }

        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                status: status
            }
        })

        return NextResponse.json(updatedOrder)

    } catch (error) {
        console.error("[VENDOR_Sales_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
