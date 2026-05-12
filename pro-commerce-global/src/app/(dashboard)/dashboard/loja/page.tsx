import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MapPin, Phone, Settings, Store as StoreIcon } from "lucide-react"

export default async function StorePage() {
    const session = await auth()
    if (!session?.user?.email) redirect('/auth/login')

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) return <div>Loja não encontrada</div>

    const store = user.store

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Minha Loja</h1>
                    <p className="text-slate-500 mt-1">Visão geral do perfil público da sua loja.</p>
                </div>
                <Link
                    href="/dashboard/loja/configuracoes"
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    <Settings className="w-5 h-5" />
                    Editar Configurações
                </Link>
            </div>

            {/* Banner & Logo */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-100 h-64 md:h-80 shadow-sm border border-slate-200">
                {store.banner ? (
                    <img src={store.banner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <span className="text-sm font-bold uppercase tracking-widest">Sem Banner</span>
                    </div>
                )}

                <div className="absolute -bottom-12 left-8 md:left-12">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-4 border-white bg-white shadow-xl overflow-hidden">
                        {store.logo ? (
                            <img src={store.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                                <StoreIcon className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-16 px-4 md:px-8 space-y-8">
                {/* Store Info */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-4xl font-black text-slate-900 mb-2">{store.name}</h2>
                            {store.description && (
                                <p className="text-slate-600 leading-relaxed text-lg">{store.description}</p>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                            <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Contato e Localização</h3>
                            {store.phone && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Phone className="w-5 h-5 text-brand-gold" />
                                    </div>
                                    <span className="font-medium">{store.phone}</span>
                                </div>
                            )}
                            {store.address && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <MapPin className="w-5 h-5 text-brand-gold" />
                                    </div>
                                    <span className="font-medium">{store.address}</span>
                                </div>
                            )}
                            {!store.phone && !store.address && (
                                <p className="text-slate-400 italic">Nenhuma informação de contato adicionada.</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                            <h3 className="font-bold text-slate-900 mb-2 uppercase text-xs tracking-wider">Configuração de Entrega</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Taxa Fixa</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(store.deliveryBaseFee))}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl text-center">
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Por Km</p>
                                    <p className="text-2xl font-black text-slate-900">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(store.deliveryPricePerKm))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
