import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar, Gift, Clock, MapPin } from "lucide-react"
import EventParticipationForm from "./EventParticipationForm" // Client Component

export default async function PublicEventPage({ params }: { params: { id: string } }) {
    if (!(prisma as any).event) return notFound() // Safety check for stale client

    const event = await (prisma as any).event.findUnique({
        where: { id: params.id },
        include: {
            store: true,
            _count: { select: { participants: true } }
        }
    })

    if (!event) return notFound()

    const isEnded = event.status === 'ENDED' || new Date() > new Date(event.endDate)

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Banner */}
            <div className="relative h-[25vh] md:h-[40vh] bg-slate-900 overflow-hidden">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-60" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end">
                    <div className="container mx-auto px-4 pb-8 md:pb-12">
                        <span className="inline-block px-3 py-1 rounded-full bg-brand-gold text-white text-xs font-bold mb-4">
                            {event.type}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{event.title}</h1>
                        <p className="text-slate-300 text-lg md:text-xl max-w-2xl">{event.store.name}</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 -mt-8 relative z-10 grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Sobre o Evento</h2>
                        <div className="prose prose-slate max-w-none text-slate-600">
                            <p className="whitespace-pre-line">{event.description}</p>
                        </div>

                        <div className="mt-8 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-yellow-900 mb-1">Prémio</h3>
                                <p className="text-yellow-700">{event.prizeDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Participation Form */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-24">
                        <div className="mb-6 space-y-3">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar className="w-5 h-5 text-brand-gold" />
                                <div>
                                    <p className="text-xs text-slate-400 font-medium uppercase">Data de Fim</p>
                                    <p className="font-bold text-slate-900">{format(new Date(event.endDate), "dd 'de' MMMM", { locale: ptBR })}</p>
                                </div>
                            </div>
                            {event.store.address && (
                                <div className="flex items-center gap-3 text-slate-600">
                                    <MapPin className="w-5 h-5 text-brand-gold" />
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase">Local</p>
                                        <p className="font-bold text-slate-900 line-clamp-1">{event.store.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-slate-100 my-6" />

                        {isEnded ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Evento Encerrado</h3>
                                <p className="text-slate-500">Este evento já terminou. Fique atento aos próximos!</p>
                            </div>
                        ) : (
                            <EventParticipationForm event={event} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
