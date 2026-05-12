import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Trophy, Calendar, Store, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export default async function AdminEventsPage() {
    const session = await auth()
    //   if (session?.user?.role !== 'ADMIN') return redirect("/") // Assuming middleware handles this or layout

    let events = [];
    try {
        if (!(prisma as any).event) {
            throw new Error("Model Event not found (Restart Required)");
        }
        events = await (prisma as any).event.findMany({
            include: {
                store: true,
                _count: { select: { participants: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
    } catch (e) {
        return (
            <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
                <h3 className="text-xl font-bold text-red-800 mb-2">Atualização Necessária</h3>
                <p className="text-red-700 mb-4">O sistema detectou uma atualização no banco de dados. Reinicie o servidor para carregar os eventos.</p>
                <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm inline-block text-left text-sm font-mono text-slate-700">
                    <p>1. Pare o terminal (Ctrl+C)</p>
                    <p>2. Execute: npx prisma generate</p>
                    <p>3. Execute: npm run dev</p>
                </div>
                <div className="mt-4 p-4 bg-slate-100 rounded text-xs text-left font-mono overflow-auto max-h-32">
                    <strong>Debug Info (Available Models):</strong>
                    <br />
                    {Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')).join(', ')}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Eventos</h1>
                    <p className="text-slate-500 mt-1">Supervisão de todos os concursos e sorteios da plataforma.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-100">
                        <p className="text-slate-500">Nenhum evento encontrado no sistema.</p>
                    </div>
                ) : (
                    events.map((event: any) => (
                        <div key={event.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                            <div className="h-32 bg-slate-900 relative">
                                {event.imageUrl ? (
                                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-60" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                                )}
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${event.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                                        event.status === 'ENDED' ? 'bg-white text-slate-900' :
                                            'bg-yellow-500 text-white'
                                        }`}>
                                        {event.status}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="font-bold text-slate-900 truncate" title={event.title}>{event.title}</h3>
                                    <Link href={`/admin/lojas/${event.store.id}`} className="text-xs text-brand-gold hover:underline flex items-center gap-1 mt-1">
                                        <Store className="w-3 h-3" />
                                        {event.store.name}
                                    </Link>
                                </div>

                                <div className="mt-auto space-y-2 text-xs text-slate-500">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {format(new Date(event.startDate), "d MMM", { locale: ptBR })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {event._count.participants}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-100">
                                        <span className="font-medium text-slate-700">Tipo:</span> {event.type}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                                    <Link
                                        href={`/eventos/${event.id}`}
                                        target="_blank"
                                        className="flex-1 py-2 text-center text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Ver Público
                                    </Link>
                                    {/* Future: Delete/Moderate Action */}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
