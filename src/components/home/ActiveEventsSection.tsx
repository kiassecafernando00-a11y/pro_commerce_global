"use client"

import Link from "next/link"
import { Trophy, Gift, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { getActiveEventsForHome } from "@/app/actions/events"

interface EventData {
    id: string
    title: string
    description: string
    type: string
    prizeDescription: string
    imageUrl: string | null
    store: { name: string }
}

interface WinnerData {
    id: string
    name: string
    event: { title: string }
}

export default function ActiveEventsSection() {
    const [data, setData] = useState<{ events: EventData[], recentWinners: WinnerData[] } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const res = await getActiveEventsForHome()
                setData(res)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return null // Or a skeleton
    if (!data || (data.events.length === 0 && data.recentWinners.length === 0)) return null

    const { events, recentWinners } = data

    return (
        <section className="py-16 bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative">
            {/* Abstract Background */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-gold/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-full bg-blue-500/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="inline-block px-3 py-1 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-full text-xs font-bold mb-3">
                            EVENTOS & PRÉMIOS
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black">Ganhe Prémios Incríveis</h2>
                        <p className="text-slate-400 mt-2 max-w-lg">
                            Participe dos sorteios e concursos exclusivos das nossas lojas parceiras.
                        </p>
                    </div>
                    {/* <Link href="/eventos" className="text-brand-gold font-bold hover:text-white transition-colors flex items-center gap-2">
                Ver Todos <ArrowRight className="w-4 h-4" />
            </Link> */}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Active Events Column */}
                    <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                        {events.map(event => (
                            <Link key={event.id} href={`/eventos/${event.id}`} className="group relative bg-white/5 border border-white/10 hover:border-brand-gold/50 rounded-2xl overflow-hidden hover:transform hover:-translate-y-1 transition-all duration-300">
                                <div className="h-40 relative">
                                    {event.imageUrl ? (
                                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-800" />
                                    )}
                                    <div className="absolute top-3 left-3 bg-brand-gold text-slate-900 text-xs font-black px-2 py-1 rounded">
                                        {event.type}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-brand-gold transition-colors line-clamp-1">{event.title}</h3>
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{event.description}</p>

                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-300">
                                        <div className="flex items-center gap-1">
                                            <Gift className="w-3 h-3 text-brand-gold" />
                                            {event.prizeDescription}
                                        </div>
                                        {/* <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Fim: {new Date(event.endDate).toLocaleDateString()}
                                </div> */}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Winners Column */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="w-5 h-5 text-brand-gold" />
                            <h3 className="font-bold text-lg">Últimos Vencedores</h3>
                        </div>

                        <div className="space-y-4">
                            {recentWinners.length > 0 ? recentWinners.map(winner => (
                                <div key={winner.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold font-bold">
                                        {winner.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{winner.name}</p>
                                        <p className="text-xs text-slate-400 truncate">Ganhou em: {winner.event.title}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-slate-500 text-sm">
                                    Ainda não há vencedores recentes.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
