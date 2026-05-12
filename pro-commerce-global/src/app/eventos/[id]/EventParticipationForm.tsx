'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { joinEvent } from '@/app/actions/events'
import toast from 'react-hot-toast'
import { Loader2, ArrowRight, CheckCircle, Smartphone, User, Mail } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    phone: z.string().min(9, "Telefone é obrigatório"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
})

// Update Props Interface
interface EventProps {
    id: string
    type: string
    quizQuestion?: string | null
}

export default function EventParticipationForm({ event }: { event: EventProps | any }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    // Update Form Schema dynamically or just use optional
    // We stick to one schema but validate submissionData if needed

    // We need to add submissionData to the form
    const form = useForm({
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            submissionData: ''
        }
    })

    async function onSubmit(values: any) {
        setLoading(true)
        try {
            const result = await joinEvent({
                eventId: event.id,
                name: values.name,
                phone: values.phone,
                email: values.email,
                submissionData: values.submissionData
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                setSuccess(true)
                toast.success("Participação confirmada!")
            }
        } catch (error) {
            toast.error("Erro ao participar")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {event.type === 'QUIZ' ? 'Resposta Correta!' : 'Participação Confirmada!'}
                </h3>
                <p className="text-slate-500 mb-6">Boa sorte! Avisaremos se for o vencedor.</p>
                <button
                    onClick={() => setSuccess(false)}
                    className="text-brand-gold font-bold text-sm hover:underline"
                >
                    Voltar
                </button>
            </div>
        )
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Participar Agora</h3>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* DYNAMIC FIELD FOR QUIZ */}
                {event.type === 'QUIZ' && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                        <p className="text-sm font-bold text-blue-900">Pergunda do Desafio:</p>
                        <p className="text-lg font-black text-blue-800">{event.quizQuestion}</p>
                        <input
                            {...form.register('submissionData', { required: "Sua resposta é obrigatória" })}
                            className="w-full px-4 py-3 mt-2 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Sua resposta..."
                        />
                        {form.formState.errors.submissionData && <p className="text-red-500 text-xs">Resposta obrigatória</p>}
                    </div>
                )}

                {/* DYNAMIC FIELD FOR CONTEST/CHALLENGE */}
                {(event.type === 'CONTEST' || event.type === 'CHALLENGE') && (
                    <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl space-y-2">
                        <p className="text-sm font-bold text-purple-900">{event.type === 'CONTEST' ? 'Por que você deve ganhar?' : 'Sua resposta ao desafio'}</p>
                        <textarea
                            {...form.register('submissionData', { required: "Campo obrigatório" })}
                            className="w-full px-4 py-3 mt-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 h-24"
                            placeholder="Escreva aqui..."
                        />
                        {form.formState.errors.submissionData && <p className="text-red-500 text-xs">Campo obrigatório</p>}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...form.register('name', { required: "Nome obrigatório" })}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                            placeholder="Seu nome"
                        />
                    </div>
                    {form.formState.errors.name && <p className="text-red-500 text-xs">Nome obrigatório</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
                    <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...form.register('phone', { required: "Telefone obrigatório" })}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                            placeholder="9XX XXX XXX"
                        />
                    </div>
                    {form.formState.errors.phone && <p className="text-red-500 text-xs">Telefone obrigatório</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Email (Opcional)</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            {...form.register('email')}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                            placeholder="email@exemplo.com"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                            {event.type === 'QUIZ' ? 'Responder & Participar' : 'Quero Ganhar!'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
                <p className="text-xs text-center text-slate-400">Ao participar, concorda com as regras do evento.</p>
            </form>
        </div>
    )
}
