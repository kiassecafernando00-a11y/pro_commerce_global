
"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import {
    TrendingUp,
    Package,
    ShoppingBag,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Settings,
    Plus,
    BarChart3,
    Star,
    Users
} from "lucide-react"

interface DashboardData {
    totalSales: number
    totalOrders: number
    totalProducts: number
    storeName: string
    recentOrders: {
        id: string
        customer: string
        date: string
        status: string
        total: number
    }[]
}

export default function DashboardPage() {
    const { data: session } = useSession()
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [storeStatus, setStoreStatus] = useState("PENDING") // PENDING, APPROVED, REJECTED
    const [adminPaymentInfo, setAdminPaymentInfo] = useState("")

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            try {
                // Fetch Stats
                const response = await fetch("/api/dashboard")
                if (response.ok) setData(await response.json())

                // Fetch Store Status
                const resStore = await fetch("/api/vendor/settings")
                if (resStore.ok) {
                    const storeData = await resStore.json()
                    setStoreStatus(storeData.status || "PENDING")
                }

                // Fetch Admin Payment Info
                const resSettings = await fetch("/api/admin/settings")
                if (resSettings.ok) {
                    const settingsData = await resSettings.json()
                    setAdminPaymentInfo(settingsData.adminPaymentInfo)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Logic for "Next Steps" Progress
    const calculateProgress = () => {
        let steps = 0;
        let totalSteps = 4;

        if (data?.storeName) steps++; // Account Created
        if (storeStatus === "APPROVED") steps++; // Approved
        if (data?.totalProducts && data.totalProducts > 0) steps++; // First Product
        // Mock step for "Configuration" as we don't have a specific check yet
        if (data?.storeName) steps++;

        return Math.round((steps / totalSteps) * 100);
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        </div>
    )

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* 1. Header & Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        Painel de Controle
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Bem-vindo, {session?.user?.name?.split(' ')[0]}
                    </p>
                </div>

                {/* Store Status Badge */}
                <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border ${storeStatus === 'APPROVED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : storeStatus === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${storeStatus === 'APPROVED' ? 'bg-emerald-500' : storeStatus === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                    {storeStatus === 'APPROVED' ? 'Loja Ativa' : storeStatus === 'PENDING' ? 'Em Análise' : 'Suspensa'}
                </div>
            </div>

            {/* 2. Alert Section (If Pending) */}
            {storeStatus === "PENDING" && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Aprovação Pendente</h3>
                            <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
                                Sua loja está em fase de verificação. Para ativar suas vendas, finalize o processo de inscrição.
                            </p>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        <Link href="/dashboard/pagamento-taxa" className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm text-sm">
                            Finalizar Inscrição <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                </div>
            )}

            {/* 3. KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Sales Card */}
                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            {/* <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span> */}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(data?.totalSales || 0)}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Vendas Totais</p>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                                <ShoppingBag className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {data?.totalOrders || 0}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Pedidos Realizados</p>
                    </div>
                </div>

                {/* Products Card */}
                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                                <Package className="w-5 h-5" />
                            </div>
                            <Link href="/dashboard/produtos/novo" className="text-xs font-medium text-white bg-slate-900 px-3 py-1 rounded-md hover:bg-slate-800 transition-colors">
                                + Novo
                            </Link>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {data?.totalProducts || 0}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Produtos Ativos</p>
                    </div>
                </div>

                {/* Store Rating Card */}
                <div className="card-premium p-6 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                <Star className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">5.0</h3>
                            <span className="text-sm text-slate-400">/ 5.0</span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium mt-1">Avaliação da Loja</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* 4. Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        Ações Rápidas
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Link href="/dashboard/produtos/novo" className="card-premium p-5 group cursor-pointer hover:border-blue-200 hover:ring-1 hover:ring-blue-100 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Adicionar Produto</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Cadastre novos itens no catálogo.</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard/produtos" className="card-premium p-5 group cursor-pointer hover:border-slate-300 hover:ring-1 hover:ring-slate-100 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Gerenciar Produtos</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Edite preços e estoque.</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard/loja" className="card-premium p-5 group cursor-pointer hover:border-slate-300 hover:ring-1 hover:ring-slate-100 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Configurar Loja</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Personalize sua presença.</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/dashboard/loja/configuracoes" className="card-premium p-5 group cursor-pointer hover:border-slate-300 hover:ring-1 hover:ring-slate-100 transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors flex-shrink-0">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-1">Financeiro</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Taxas e dados bancários.</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 5. Next Steps / Onboarding */}
                <div className="lg:col-span-1">
                    <div className="card-premium p-6 h-full border-t-4 border-t-blue-600">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-700 font-bold border border-slate-100">
                                {calculateProgress()}%
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Configuração</h3>
                                <p className="text-xs text-slate-500">Progresso da conta</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000"
                                style={{ width: `${calculateProgress()}%` }}
                            ></div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 opacity-50">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-slate-700 line-through">Conta Criada</p>
                                </div>
                            </div>

                            <div className={`flex items-start gap-3 ${storeStatus === 'APPROVED' ? 'opacity-50' : ''}`}>
                                {storeStatus === 'APPROVED' ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 mt-0.5 flex-shrink-0"></div>
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${storeStatus === 'APPROVED' ? 'text-slate-700 line-through' : 'text-slate-900'}`}>Aprovação da Loja</p>
                                    {storeStatus === 'PENDING' && <p className="text-xs text-amber-600 mt-1">Em análise</p>}
                                </div>
                            </div>

                            <div className={`flex items-start gap-3 ${data?.totalProducts && data.totalProducts > 0 ? 'opacity-50' : ''}`}>
                                {data?.totalProducts && data.totalProducts > 0 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                                ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 mt-0.5 flex-shrink-0"></div>
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${data?.totalProducts && data.totalProducts > 0 ? 'text-slate-700 line-through' : 'text-slate-900'}`}>Primeiro Produto</p>
                                    {!data?.totalProducts && <Link href="/dashboard/produtos/novo" className="text-xs text-blue-600 hover:underline mt-1 block font-medium">Cadastrar agora</Link>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
