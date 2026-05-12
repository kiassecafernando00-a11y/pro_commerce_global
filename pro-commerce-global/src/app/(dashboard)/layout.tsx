"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"
import { Package, ShoppingCart, Settings, LogOut, Home, Wallet, FileText, LayoutDashboard, BarChart2, Store, Trophy } from "lucide-react"


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "loading") return

        if (status === "unauthenticated") {
            router.push("/auth/login")
        } else if (session?.user?.role !== "VENDOR" && session?.user?.role !== "ADMIN") {
            router.push("/")
        }
    }, [status, session, router])

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!session || (session.user.role !== "VENDOR" && session.user.role !== "ADMIN")) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="text-xl font-bold text-brand-dark">
                        Pro<span className="text-brand-gold">Commerce</span>Global
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Olá, <span className="font-semibold">{session.user.name}</span>
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-sm text-gray-600 hover:text-brand-dark transition-colors"
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white min-h-[calc(100vh-73px)] border-r border-gray-200">
                    <nav className="p-4 space-y-2">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <LayoutDashboard className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                            href="/dashboard/produtos"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Package className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Produtos</span>
                        </Link>
                        <Link
                            href="/dashboard/vendas"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <ShoppingCart className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Pedidos</span>
                        </Link>

                        <Link
                            href="/dashboard/relatorios"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <BarChart2 className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Relatórios</span>
                        </Link>
                        <Link
                            href="/dashboard/loja/pagamentos"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Wallet className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Pagamentos</span>
                        </Link>
                        <Link
                            href="/dashboard/loja"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Store className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Minha Loja</span>
                        </Link>
                        <Link
                            href="/dashboard/loja/eventos"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Trophy className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Meus Eventos</span>
                        </Link>
                        <Link
                            href="/dashboard/loja/configuracoes"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Settings className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Configurações</span>
                        </Link>
                        <Link
                            href="/dashboard/carteira"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-brand-dark hover:bg-blue-50 group"
                        >
                            <Wallet className="w-5 h-5 text-gray-500 group-hover:text-brand-dark" />
                            <span className="font-medium">Carteira</span>
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
