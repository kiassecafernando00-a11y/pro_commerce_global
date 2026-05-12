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

        // Generate Excel
        const buffer = await ReportService.generateExcel(
            user.store.id,
            user.store.name
        )

        // Return as downloadable file
        return new NextResponse(buffer as any, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="transacoes_${user.store.name.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx"`
            }
        })

    } catch (error: any) {
        console.error('Excel export error:', error)
        return NextResponse.json(
            { error: error.message || "Erro ao gerar relatório" },
            { status: 500 }
        )
    }
}
