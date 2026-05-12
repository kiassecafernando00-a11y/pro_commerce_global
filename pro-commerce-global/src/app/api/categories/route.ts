import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true
            }
        })
        return NextResponse.json(categories)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
