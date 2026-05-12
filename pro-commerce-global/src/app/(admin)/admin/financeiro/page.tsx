import { prisma } from "@/lib/prisma"
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react"

export default async function AdminFinancePage() {
    // 1. Calculate Receivables (Pending Debt from Stores)
    const stores = await prisma.store.findMany({
        select: { commissionDebt: true, name: true }
    })

    const totalReceivables = stores.reduce((acc, store) => acc + Number(store.commissionDebt), 0)

    // 2. Calculate Revenue (REAL-TIME from Ledger)
    // We sum all COMPLETED transactions that represent income (Registration, Commission, Subscription, Sale fees if any)
    const revenueStats = await prisma.transaction.aggregate({
        where: {
            status: 'COMPLETED',
            type: { in: ['REGISTRATION_FEE', 'COMMISSION', 'SUBSCRIPTION'] }
        },
        _sum: { amount: true }
    })

    const totalRevenue = Number(revenueStats._sum.amount || 0)

    // Breakdown
    const registrationStats = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED', type: 'REGISTRATION_FEE' },
        _sum: { amount: true }
    })
    const totalRegistrationCollected = Number(registrationStats._sum.amount || 0)

    const commissionStats = await prisma.transaction.aggregate({
        where: { status: 'COMPLETED', type: { in: ['COMMISSION', 'SUBSCRIPTION'] } },
        _sum: { amount: true }
    })
    const totalCommissionCollected = Number(commissionStats._sum.amount || 0)


    // Recent Transactions (System Ledger)
    const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { store: true }
    })

    function formatCurrency(val: number) {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)
    }

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <h1 className="text-3xl font-black text-slate-900">Visão Financeira Global</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-slate-400 mb-2 font-bold text-sm uppercase">
                            <Wallet className="w-4 h-4" /> Receita Total Arrecadada
                        </div>
                        <p className="text-3xl font-black">{formatCurrency(totalRevenue)}</p>
                        <div className="mt-4 flex gap-4 text-xs font-semibold text-slate-300">
                            <span>Inscrições: {formatCurrency(totalRegistrationCollected)}</span>
                            <span className="w-px h-4 bg-slate-700"></span>
                            <span>Comissões: {formatCurrency(totalCommissionCollected)}</span>
                        </div>
                    </div>
                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold text-sm uppercase">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> A Receber (Dívidas)
                    </div>
                    <p className="text-3xl font-black text-slate-900">{formatCurrency(totalReceivables)}</p>
                    <p className="text-xs text-slate-400 mt-2">Valor acumulado de comissões não pagas.</p>
                </div>
            </div>

            {/* Transaction Ledger */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Livro Razão (Últimas Transações)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Loja/Referência</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-slate-500">
                                        {new Date(t.createdAt).toLocaleDateString('pt-AO')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'COMMISSION_DEBT' ? 'bg-purple-100 text-purple-700' :
                                            t.type === 'SALE' ? 'bg-green-100 text-green-700' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {t.store?.name || "-"}
                                        <span className="block text-xs text-slate-400 font-normal">{t.reference}</span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                        {t.description}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-bold">
                                        {formatCurrency(Number(t.amount))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
