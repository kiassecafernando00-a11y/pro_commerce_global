import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LanguageSelector } from "@/components/LanguageSelector";
import { LayoutDashboard, Users, ShoppingBag, Settings, Wallet, Globe, ShieldAlert, FolderOpen, Megaphone, Package, DollarSign, Tag, MessageSquare, Check, Trophy } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Robust Admin Check (In production, use strict role check)
    // For now, if no role is distinct, assume we need to check strict email or role ADMIN
    if (!session || (session.user?.email !== "admin@procommerce.com" && session.user?.role !== "ADMIN")) {
        // Strict check: Redirect to home if not authorized
        redirect("/");
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex font-sans">
            {/* Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-50">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-black text-yellow-400 tracking-tight uppercase">
                        Admin Panel
                    </h1>
                    <p className="text-xs text-white font-bold opacity-80 mt-1">ProCommerce Global System</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Visão Geral</p>
                    <NavLink href="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" />

                    <p className="text-xs font-bold text-slate-500 uppercase px-2 mt-6 mb-2">Gestão</p>
                    {/* Original NavLink for Finance is replaced/modified based on the instruction's snippet */}
                    {/* The instruction's snippet seems to replace the original finance link with new Link components */}
                    {/* Reinterpreting to add new links while keeping the existing NavLink component structure where possible */}
                    <NavLink href="/admin/utilizadores" icon={<Users />} label="Utilizadores & Lojas" />
                    {/* Adding new links as per the instruction's snippet, adapting to NavLink component */}
                    <NavLink href="/admin/pedidos" icon={<Package />} label="Pedidos" />
                    {/* Financeiro */}
                    <div className="space-y-1">
                        <NavLink href="/admin/financeiro/aprovacoes" icon={<Check />} label="Aprovações de Pagamento" />
                        <NavLink href="/admin/financeiro" icon={<DollarSign />} label="Visão Financeira" />
                    </div>
                    <NavLink href="/admin/financeiro/configuracoes" icon={<Settings />} label="⚙️ Taxas & Comissões" />
                    <NavLink href="/admin/produtos" icon={<ShoppingBag />} label="Catálogo Global" />
                    <NavLink href="/admin/categorias" icon={<FolderOpen />} label="Gestão de Categorias" />
                    <NavLink href="/admin/marketing" icon={<Megaphone />} label="Marketing & Destaques" />
                    <NavLink href="/admin/marketing/coupons" icon={<Tag />} label="Gestão de Cupons" />
                    <NavLink href="/admin/eventos" icon={<Trophy />} label="Gestão de Eventos" />
                    <NavLink href="/admin/reviews" icon={<MessageSquare />} label="Gestão de Avaliações" />

                    <p className="text-xs font-bold text-slate-500 uppercase px-2 mt-6 mb-2">Sistema</p>
                    <NavLink href="/admin/sistema" icon={<Settings />} label="⚙️ Configuração & Status" />
                    <NavLink href="/admin/configuracoes" icon={<Settings />} label="Configurações Gerais" />
                    <NavLink href="/admin/audit" icon={<ShieldAlert />} label="Auditoria & Logs" />
                </nav>

                <div className="p-4 border-t border-slate-700">

                    <div className="flex items-center justify-between mb-4">
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group border border-slate-700 hover:border-brand-gold/50 flex-1"
                        >
                            <span className="group-hover:text-brand-gold transition-colors"><Globe className="w-5 h-5" /></span>
                            <span className="font-medium">Site</span>
                        </Link>
                        <div className="ml-2">
                            <LanguageSelector variant="gear" placement="top" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-slate-900 font-bold">
                            A
                        </div>
                        <div>
                            <p className="text-sm font-bold">Administrador</p>
                            <p className="text-xs text-green-400">Online</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all group"
        >
            <span className="group-hover:text-brand-gold transition-colors">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    )
}
