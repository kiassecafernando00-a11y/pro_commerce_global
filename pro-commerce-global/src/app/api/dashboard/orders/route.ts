import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "VENDOR") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) return NextResponse.json({ orders: [] })

        // Find orders that contain items from this store
        const orders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        product: {
                            storeId: store.id
                        }
                    }
                }
            },
            include: {
                user: true,
                items: {
                    where: {
                        product: {
                            storeId: store.id
                        }
                    },
                    include: {
                        product: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ orders })
    } catch (error) {
        console.error("[VENDOR_ORDERS_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
