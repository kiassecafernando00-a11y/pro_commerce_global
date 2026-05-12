import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Extract ID from URL path if params is not reliable
        const pathParts = req.nextUrl.pathname.split('/')
        const orderId = pathParts[3] // /api/orders/[id]

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true }
                        }
                    }
                }
            }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        // Security check: Only owner or admin
        if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
            return new NextResponse("Forbidden", { status: 403 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error("Fetch Order Error:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
