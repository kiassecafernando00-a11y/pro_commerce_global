import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notFound, redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trophy, Calendar, Users, Gift, Medal, Smartphone, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import PickWinnerButton from "./PickWinnerButton" // Client Component

export default async function ManageEventPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user?.id) return redirect("/login")

    const store = await prisma.store.findUnique({
        where: { userId: session.user.id }
    })

    if (!store) return redirect("/dashboard/loja/novo")

    const event = await prisma.event.findUnique({
        where: { id: params.id },
        include: {
            participants: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!event || event.storeId !== store.id) return notFound()

    const winner = event.participants.find(p => p.hasWon)

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <Link href="/dashboard/loja/eventos" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Eventos
            </Link>

            {/* Header */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="h-48 bg-slate-900 relative">
                    {event.imageUrl && (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-50" />
                    )}
                    <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-slate-900/90 to-transparent">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${event.status === 'ACTIVE' ? 'bg-green-500 text-white' :
                                        event.status === 'ENDED' ? 'bg-white text-slate-900' :
                                            'bg-yellow-500 text-white'
                                    }`}>
                                    {event.status === 'ACTIVE' ? 'ATIVO' : event.status === 'ENDED' ? 'ENCERRADO' : 'RASCUNHO'}
                                </span>
                                <span className="text-slate-300 text-sm flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(event.startDate), "d MMM", { locale: ptBR })} - {format(new Date(event.endDate), "d MMM, yyyy", { locale: ptBR })}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-white tracking-tight">{event.title}</h1>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Detalhes</h3>
                            <p className="text-slate-600 leading-relaxed">{event.description}</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-gold">
                                <Gift className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Prémio do Evento</p>
                                <p className="text-lg font-bold text-slate-900">{event.prizeDescription}</p>
                                <span className="text-xs px-2 py-0.5 bg-slate-200 rounded text-slate-600 font-medium capitalize">{event.prizeType.toLowerCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Participantes
                                </h3>
                                <span className="text-2xl font-black text-slate-900">{event.participants.length}</span>
                            </div>

                            {event.status === 'ACTIVE' && !winner && (
                                <PickWinnerButton eventId={event.id} hasParticipants={event.participants.length > 0} />
                            )}

                            {winner && (
                                <div className="bg-green-50 border border-green-100 rounded-xl p-4 mt-4">
                                    <p className="text-green-800 text-sm font-bold flex items-center gap-2 mb-2">
                                        <Trophy className="w-4 h-4" />
                                        Vencedor Selecionado
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-black">
                                            {winner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{winner.name}</p>
                                            <p className="text-xs text-slate-500">{winner.phone}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">Lista de Inscritos</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Nome</th>
                                <th className="px-6 py-4">Telefone</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Data Inscrição</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {event.participants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Ainda não há participantes neste evento.
                                    </td>
                                </tr>
                            ) : (
                                event.participants.map(participant => (
                                    <tr key={participant.id} className={participant.hasWon ? "bg-green-50/50" : ""}>
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                                            {participant.name}
                                            {participant.hasWon && <Medal className="w-4 h-4 text-brand-gold" />}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Smartphone className="w-3 h-3 text-slate-400" />
                                                {participant.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {participant.email ? (
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-3 h-3 text-slate-400" />
                                                    {participant.email}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {format(new Date(participant.createdAt), "d MMM HH:mm", { locale: ptBR })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {participant.hasWon ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3" /> Vencedor
                                                </span>
                                            ) : (
                                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    Participante
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
