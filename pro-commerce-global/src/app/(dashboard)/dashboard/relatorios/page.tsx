import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ReportService } from "@/services/reports/report.service"
import ReportsDashboard from "@/components/reports/ReportsDashboard"

export default async function VendorReportsPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) {
        return <div>Loja não encontrada</div>
    }

    // Get last 30 days stats
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const stats = await ReportService.getSummaryStats(user.store.id, thirtyDaysAgo)
    const recentTransactions = await ReportService.getTransactionReport(user.store.id)

    return (
        <div className="min-h-screen bg-gray-50/50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ReportsDashboard
                    stats={stats}
                    transactions={recentTransactions}
                    store={{
                        name: user.store.name,
                        id: user.store.id,
                        nif: user.store.nif || user.nif || undefined
                    }}
                    vendor={{
                        name: user.name || "Vendedor",
                        email: user.email,
                        nif: user.nif || undefined
                    }}
                />
            </div>
        </div>
    )
}
