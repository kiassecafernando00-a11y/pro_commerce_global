import { prisma } from "@/lib/prisma"
import { Users, ShoppingBag, Package, DollarSign } from "lucide-react"

// Server Component Fetching
async function getAdminAlerts() {
    const pendingStores = await prisma.store.count({ where: { status: "PENDING" } })
    const pendingWithdrawals = await prisma.transaction.count({ where: { status: "PENDING", type: "WITHDRAWAL" } })
    return { pendingStores, pendingWithdrawals }
}

export default async function AdminDashboardPage() {
    // 1. Fetch Stats & Alerts (Parallel)
    const statsPromise = fetch("http://localhost:3000/api/admin/stats", { next: { revalidate: 60 } }).then(res => res.json()).catch(() => null)
    const alertsPromise = getAdminAlerts()

    const [stats, alerts] = await Promise.all([statsPromise, alertsPromise])

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Painel Geral (Admin)</h1>

            {/* ALERTS SECTION */}
            {(alerts.pendingStores > 0 || alerts.pendingWithdrawals > 0) && (
                <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 overflow-hidden">
                    <div className="bg-amber-100/50 p-4 border-b border-amber-200 flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Package className="w-5 h-5 text-amber-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-amber-900">Atenção Necessária</h3>
                            <p className="text-xs text-amber-800">Existem itens pendentes que requerem sua aprovação.</p>
                        </div>
                        <a href="/admin/utilizadores" className="ml-auto bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-amber-700 shadow-sm transition-colors">
                            Revisar Agora
                        </a>
                    </div>
                    <div className="p-4 flex gap-6 text-sm">
                        {alerts.pendingStores > 0 && (
                            <div className="flex items-center gap-2 text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                                <b>{alerts.pendingStores}</b> Novas Lojas
                            </div>
                        )}
                        {alerts.pendingWithdrawals > 0 && (
                            <div className="flex items-center gap-2 text-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                                <b>{alerts.pendingWithdrawals}</b> Saques Pendentes
                                <a href="/admin/financeiro" className="text-blue-600 text-xs underline ml-1 font-medium">Ver</a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.totalUsers || 0}</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Utilizadores</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">
                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0)}
                    </p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Receita Total</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.totalOrders || 0}</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Pedidos</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                        <Package className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats?.totalProducts || 0}</p>
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Produtos</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Gestão Global</h2>
                <p className="text-slate-500 mb-6">Aceda às áreas específicas para gestão detalhada.</p>
                <div className="flex gap-4 justify-center">
                    <a href="/admin/pedidos" className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm">Ver Todos os Pedidos</a>
                    <a href="/admin/utilizadores" className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-sm">Gerir Utilizadores</a>
                </div>
            </div>
        </div>
    )
}
