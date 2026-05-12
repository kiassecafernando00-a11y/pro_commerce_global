import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
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

        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                store: {
                                    include: {
                                        bankAccounts: true, // Fetch vendor bank accounts
                                        user: {
                                            select: { name: true, email: true, image: true }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!order) {
            return new NextResponse("Order not found", { status: 404 })
        }

        if (order.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error("[ORDER_PAYMENT_INFO]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
