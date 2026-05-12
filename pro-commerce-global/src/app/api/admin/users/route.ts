import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                store: true,
                _count: {
                    select: { orders: true }
                }
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id || session.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { userId, role } = body

        const user = await prisma.user.update({
            where: { id: userId },
            data: { role }
        })

        // If promoting to VENDOR, ensure Store exists (optional, could be done on first login)
        if (role === 'VENDOR') {
            const existingStore = await prisma.store.findUnique({ where: { userId } })
            if (!existingStore) {
                await prisma.store.create({
                    data: {
                        userId,
                        name: `Loja de ${user.name}`
                    }
                })
            }
        }

        return NextResponse.json({ success: true, user })
    } catch (error) {
        console.error("[ADMIN_USERS_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
