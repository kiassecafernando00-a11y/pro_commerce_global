import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ReportService } from "@/services/reports/report.service"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user || session.user.role !== "VENDOR") {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        // Buscar loja do vendedor
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id },
            include: {
                products: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        })

        if (!store) {
            return NextResponse.json(
                { error: "Loja não encontrada" },
                { status: 404 }
            )
        }

        // Fetch real stats
        const stats = await ReportService.getSummaryStats(store.id)

        return NextResponse.json({
            totalProducts: store._count.products,
            totalOrders: stats.saleCount,
            totalRevenue: stats.totalSales,
            storeName: store.name,
        })
    } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
        return NextResponse.json(
            { error: "Erro ao carregar dados" },
            { status: 500 }
        )
    }
}
