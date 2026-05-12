import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Trophy, Plus, Calendar, Users, Gift, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"

export default async function VendorEventsPage() {
    const session = await auth()
    if (!session?.user?.id) return redirect("/login")

    // 1. Fetch Store (Safe, old model)
    let store;
    try {
        store = await prisma.store.findUnique({
            where: { userId: session.user.id },
            // Removed 'include: events' to prevent crash on outdated client
        })
    } catch (e) {
        return <div className="p-8 text-center text-red-500">Erro: {(e as Error).message}</div>
    }

    if (!store) return redirect("/dashboard/loja/novo")

    // 2. Fetch Events (Risky, new model)
    let events = []
    try {
        // Cast to any to bypass TS check, check if model exists at runtime
        if ((prisma as any).event) {
            events = await (prisma as any).event.findMany({
                where: { storeId: store.id },
                include: { _count: { select: { participants: true } } },
                orderBy: { createdAt: 'desc' }
            })
        } else {
            console.warn("Prisma Client out of sync: Event model missing")
        }
    } catch (e) {
        console.error("Failed to fetch events:", e)
    }

    // Adapt the UI to use the 'events' variable instead of 'store.events'

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-brand-gold" />
                        Meus Eventos
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Crie sorteios, concursos e desafios para engajar seus clientes.
                    </p>
                </div>
                <Link
                    href="/dashboard/loja/eventos/novo"
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Evento
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trophy className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            {!(prisma as any).event ? "Reinicie o servidor" : "Nenhum evento criado"}
                        </h3>
                        <p className="text-slate-500 max-w-md mx-auto mb-6">
                            {!(prisma as any).event ?
                                "O banco de dados foi atualizado. É necessário reiniciar o terminal (npm run dev)." :
                                "Comece agora a criar eventos para interagir com seu público e aumentar suas vendas."
                            }
                        </p>
                        <Link
                            href="/dashboard/loja/eventos/novo"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Criar Primeiro Evento
                        </Link>
                    </div>
                ) : (
                    events.map((event: any) => (
                        <Link
                            key={event.id}
                            href={`/dashboard/loja/eventos/${event.id}`}
                            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                        >
                            <div className="h-32 bg-slate-100 relative">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-gold/10">
                                        <Gift className="w-12 h-12 text-brand-gold/50" />
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${event.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                                    event.status === 'ENDED' ? 'bg-slate-900 text-white' :
                                        'bg-yellow-500 text-white'
                                    }`}>
                                    {event.status === 'ACTIVE' ? 'ATIVO' : event.status === 'ENDED' ? 'ENCERRADO' : 'RASCUNHO'}
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span>
                                            {format(new Date(event.startDate), "d MMM", { locale: ptBR })} - {format(new Date(event.endDate), "d MMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span>{event._count.participants} participantes</span>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-sm font-medium text-brand-gold">
                                        <Gift className="w-4 h-4" />
                                        <span>Prémio: {event.prizeDescription}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
