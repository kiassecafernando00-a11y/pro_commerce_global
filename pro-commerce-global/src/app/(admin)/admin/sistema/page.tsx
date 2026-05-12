import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CheckCircle, XCircle, AlertCircle, Settings, Database, Mail, CreditCard } from "lucide-react"

export default async function SystemSetupPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
        redirect('/')
    }

    // Direct Checks (Server Component Pattern)
    const envChecks = {
        database: !!process.env.DATABASE_URL,
        nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthUrl: !!process.env.NEXTAUTH_URL,
        stripeSecret: !!process.env.STRIPE_SECRET_KEY,
        stripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
        stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
        resendApi: !!process.env.RESEND_API_KEY,
        baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL
    }

    // Check database connection
    let dbStatus = 'disconnected'
    let dbError = null
    try {
        await prisma.user.findFirst({ select: { id: true } })
        dbStatus = 'connected'
    } catch (e: any) {
        console.error("DB CONN ERROR:", e)
        dbError = e.message
    }

    // Check system config
    let systemConfig = null
    try {
        systemConfig = await prisma.systemConfig.findUnique({
            where: { id: 'global' }
        })
    } catch (e) {
        // Config doesn't exist yet
    }

    // Get stats with safe fallbacks
    const stats = {
        users: await safeCount(prisma.user),
        stores: await safeCount(prisma.store),
        products: await safeCount(prisma.product),
        orders: await safeCount(prisma.order),
        transactions: await safeCount(prisma.transaction),
        // Wallet check removed for safety if types are stale, can add back later or infer
        wallets: 0
    }

    // Helper to avoid throwing on stats
    async function safeCount(model: any) {
        try {
            return await model.count()
        } catch {
            return 0
        }
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">⚙️ Sistema - Configuração</h1>
                <p className="text-slate-400 text-lg">Verificação e configuração inicial do sistema</p>
            </div>

            {/* Database Status */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <Database className="w-6 h-6 text-blue-500" />
                    <h2 className="text-xl font-bold text-white">Base de Dados</h2>
                </div>

                {dbStatus === 'connected' ? (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg inline-flex mb-6">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Conectado</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 text-red-400">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            <span className="font-bold">Desconectado</span>
                        </div>
                        {dbError && (
                            <p className="text-xs bg-red-900/50 p-2 rounded ml-7 font-mono max-w-2xl overflow-x-auto">
                                Erro: {dbError}
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="Usuários" value={stats.users} />
                    <StatCard label="Lojas" value={stats.stores} />
                    <StatCard label="Produtos" value={stats.products} />
                    <StatCard label="Pedidos" value={stats.orders} />
                    <StatCard label="Transações" value={stats.transactions} />
                </div>
            </div>

            {/* Environment Variables */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <Settings className="w-6 h-6 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Variáveis de Ambiente</h2>
                </div>

                <div className="space-y-3">
                    <EnvCheck label="Database URL" value={envChecks.database} />
                    <EnvCheck label="NextAuth Secret" value={envChecks.nextAuthSecret} />
                    <EnvCheck label="NextAuth URL" value={envChecks.nextAuthUrl} />

                    <div className="h-6" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stripe Integration</p>
                    <EnvCheck label="Secret Key" value={envChecks.stripeSecret} icon={<CreditCard className="w-4 h-4" />} />
                    <EnvCheck label="Publishable Key" value={envChecks.stripePublishable} icon={<CreditCard className="w-4 h-4" />} />
                    <EnvCheck label="Webhook Secret" value={envChecks.stripeWebhook} icon={<CreditCard className="w-4 h-4" />} />

                    <div className="h-6" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Communication</p>
                    <EnvCheck label="Resend API Key" value={envChecks.resendApi} icon={<Mail className="w-4 h-4" />} />

                    <div className="h-4" />
                    <EnvCheck label="Base URL" value={envChecks.baseUrl} />
                </div>
            </div>

            {/* System Config */}
            <div className="bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-700">
                <h2 className="text-xl font-bold text-white mb-6">Configuração do Sistema</h2>
                {systemConfig ? (
                    <div className="space-y-4 max-w-lg">
                        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <span className="text-slate-300">Comissão da Plataforma</span>
                            <span className="text-white font-bold text-lg">{Number(systemConfig.platformFeePercent)}%</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                            <span className="text-slate-300">Taxa de Inscrição</span>
                            <span className="text-white font-bold text-lg">{Number(systemConfig.vendorRegistrationFee).toLocaleString()} Kz</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 p-4 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>Configuração Global não encontrada (Criar em Financeiro)</span>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-900/40 to-slate-900/40 rounded-xl shadow-lg p-8 border border-blue-800/30">
                <h2 className="text-xl font-bold text-white mb-6">🚀 Ações Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <a href="/admin/financeiro/configuracoes" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition-all hover:scale-105 border border-slate-700">
                        <p className="text-white font-semibold">⚙️ Taxas</p>
                        <p className="text-slate-500 text-xs mt-1">Comissões</p>
                    </a>
                    <a href="/admin/utilizadores" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition-all hover:scale-105 border border-slate-700">
                        <p className="text-white font-semibold">👥 Users</p>
                        <p className="text-slate-500 text-xs mt-1">Aprovações</p>
                    </a>
                    <a href="/admin/financeiro" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition-all hover:scale-105 border border-slate-700">
                        <p className="text-white font-semibold">💰 Financeiro</p>
                        <p className="text-slate-500 text-xs mt-1">Saques</p>
                    </a>
                    <a href="/admin/marketing" className="bg-slate-800 hover:bg-slate-700 p-4 rounded-lg transition-all hover:scale-105 border border-slate-700">
                        <p className="text-white font-semibold">📢 Marketing</p>
                        <p className="text-slate-500 text-xs mt-1">Banners</p>
                    </a>
                </div>
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-8 mt-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-500/10 p-2 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-red-200">Zona de Perigo</h2>
                        <p className="text-red-400/60 text-sm">Ações irreversíveis do sistema.</p>
                    </div>
                </div>

                <div className="bg-red-950/40 p-6 rounded-lg border border-red-900/20">
                    <h3 className="text-base font-semibold text-red-200 mb-2">Reset do Sistema (Dados de Teste)</h3>
                    <p className="text-red-400/60 text-sm mb-6 max-w-2xl">
                        Apaga pedidos, transações e logs. Mantém usuários e produtos.
                    </p>

                    <form action={async (formData) => {
                        "use server"
                        const { resetSystemData } = await import("./actions")
                        await resetSystemData(formData)
                    }} className="flex items-end gap-4">
                        <div className="flex-1 max-w-md">
                            <label className="block text-[10px] font-bold text-red-500 mb-1 uppercase tracking-wider">Confirmação</label>
                            <input
                                name="confirmationPhrase"
                                type="text"
                                placeholder="Digite: LIMPAR DADOS DE TESTE"
                                className="w-full bg-red-950/50 border border-red-900/50 text-red-200 px-4 py-2.5 rounded-lg placeholder:text-red-900/50 focus:ring-1 focus:ring-red-500 outline-none text-sm"
                            />
                        </div>
                        <button type="submit" className="bg-red-600/90 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-red-900/20 text-sm flex items-center gap-2">
                            💣 Executar
                        </button>
                    </form>
                </div>
            </div>

        </div>
    )
}

function StatCard({ label, value }: { label: string, value: number }) {
    return (
        <div className="bg-slate-900 p-3 rounded-lg">
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-white text-2xl font-bold">{value}</p>
        </div>
    )
}

function EnvCheck({ label, value, icon }: { label: string, value?: boolean, icon?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg">
            <div className="flex items-center gap-2">
                {icon}
                <span className="text-slate-300 text-sm">{label}</span>
            </div>
            {value ? (
                <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">OK</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span className="text-xs font-bold">Falta</span>
                </div>
            )}
        </div>
    )
}
