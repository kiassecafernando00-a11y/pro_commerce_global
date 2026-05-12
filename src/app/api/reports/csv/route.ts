import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ReportService } from "@/services/reports/report.service"

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Não autorizado" },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { store: true }
        })

        if (!user?.store) {
            return NextResponse.json(
                { error: "Loja não encontrada" },
                { status: 404 }
            )
        }

        // Generate CSV
        const csv = await ReportService.generateCSV(user.store.id)

        // Return as downloadable file
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="transacoes_${user.store.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (error: any) {
        console.error('CSV export error:', error)
        return NextResponse.json(
            { error: error.message || "Erro ao gerar relatório" },
            { status: 500 }
        )
    }
}
