
import { prisma } from "@/lib/prisma"
import { Users, ShoppingBag, CreditCard, TrendingUp, AlertTriangle, ArrowUpRight, Package, Activity } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getAdminKPIs() {
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } })
    const totalVendors = await prisma.user.count({ where: { role: "VENDOR" } })
    const pendingStores = await prisma.store.count({ where: { status: "PENDING" } })
    const totalOrders = await prisma.order.count()

    const sales = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "DELIVERED"] } }
    })

    return {
        totalUsers,
        totalVendors,
        pendingStores,
        totalOrders,
        totalSales: Number(sales._sum.total ?? 0),
        recentOrders: await prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        })
    }
}

export default async function AdminDashboard() {
    const kpi = await getAdminKPIs()

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-slate-500 font-medium">Bem-vindo de volta, Administrador.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm text-sm font-semibold text-slate-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistema Operacional
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ModernStatCard
                    title="Volume Total"
                    value={kpi.totalSales}
                    isCurrency
                    icon={TrendingUp}
                    color="emerald"
                    trend="+12.5%"
                    trendLabel="vs. mês passado"
                />
                <ModernStatCard
                    title="Lojas Ativas"
                    value={kpi.totalVendors}
                    icon={ShoppingBag}
                    color="blue"
                    subLabel={`${kpi.pendingStores} pendentes`}
                    subColor="orange"
                />
                <ModernStatCard
                    title="Clientes"
                    value={kpi.totalUsers}
                    icon={Users}
                    color="purple"
                    trend="+8"
                    trendLabel="novos hoje"
                />
                <ModernStatCard
                    title="Pedidos"
                    value={kpi.totalOrders}
                    icon={Package}
                    color="indigo"
                />
            </div>

            {/* Alert Section */}
            {kpi.pendingStores > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-white border-l-4 border-orange-500 p-6 rounded-r-xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">Aprovação Necessária</h3>
                            <p className="text-slate-600">Existem <span className="font-bold text-orange-600">{kpi.pendingStores} novas lojas</span> aguardando verificação.</p>
                        </div>
                    </div>
                    <Link href="/admin/utilizadores" className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 hover:shadow-orange-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
                        Revisar Agora
                    </Link>
                </div>
            )}

            {/* Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Sales */}
                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <span className="bg-green-100 p-1.5 rounded-lg text-green-600"><CreditCard className="w-4 h-4" /></span>
                            Vendas Recentes
                        </h3>
                        <Link href="/admin/finance" className="text-xs font-bold text-blue-600 hover:underline">Ver tudo</Link>
                    </div>

                    <div className="space-y-4">
                        {kpi.recentOrders.length === 0 ? (
                            <div className="text-center py-10 opacity-50">
                                <Activity className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm">Sem vendas registadas ainda.</p>
                            </div>
                        ) : (
                            kpi.recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
                                            {(order.user.name || "U")[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{order.user.name || "Cliente"}</p>
                                            <p className="text-xs text-slate-400">#{order.id.slice(-6)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">
                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(order.total))}
                                        </p>
                                        <p className="text-xs text-green-600 font-medium bg-green-50 inline-block px-2 rounded-full mt-1">
                                            {order.status}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* System Stats / Quick Actions */}
                <div className="bg-slate-900 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>

                    <h3 className="font-bold text-lg mb-6 relative z-10">Acesso Rápido</h3>

                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <Link href="/admin/produtos" className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
                            <Package className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-medium text-slate-300">Gerir Catálogo</p>
                        </Link>
                        <Link href="/admin/utilizadores" className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
                            <Users className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-medium text-slate-300">Utilizadores</p>
                        </Link>
                        <Link href="/admin/audit" className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all group">
                            <Activity className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                            <p className="text-sm font-medium text-slate-300">Auditoria</p>
                        </Link>
                        <div className="bg-slate-800/20 p-4 rounded-xl border border-slate-800 flex items-center justify-center">
                            <p className="text-xs text-slate-500 text-center">Mais em breve...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Modern Stat Card Component
function ModernStatCard({
    title,
    value,
    icon: Icon,
    color,
    isCurrency = false,
    trend,
    trendLabel,
    subLabel,
    subColor
}: {
    title: string,
    value: number | string,
    icon: any,
    color: "emerald" | "blue" | "purple" | "orange" | "indigo",
    isCurrency?: boolean,
    trend?: string,
    trendLabel?: string,
    subLabel?: string,
    subColor?: string
}) {
    const colors = {
        emerald: "bg-emerald-50 text-emerald-600",
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        indigo: "bg-indigo-50 text-indigo-600",
    }

    const colorClass = colors[color] || colors.blue

    return (
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_4px_25px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-2xl font-black text-slate-800">
                        {isCurrency
                            ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(value))
                            : value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-bold">
                        <ArrowUpRight className="w-3 h-3" />
                        {trend}
                    </div>
                )}
                {trendLabel && <span className="text-xs text-slate-400 font-medium">{trendLabel}</span>}

                {subLabel && (
                    <div className={`text-xs font-bold ${subColor === 'orange' ? 'text-orange-600 bg-orange-50' : 'text-slate-500 bg-slate-50'} px-2 py-0.5 rounded-full`}>
                        {subLabel}
                    </div>
                )}
            </div>
        </div>
    )
}
