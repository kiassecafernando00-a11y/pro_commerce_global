'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createEvent } from '@/app/actions/events'
import toast from 'react-hot-toast'
import { Loader2, ArrowLeft, Trophy, Calendar, Users, Gift, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

// Update Schema
const formSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().min(10, "A descrição deve ser mais detalhada"),
    type: z.enum(['GIVEAWAY', 'CONTEST', 'CHALLENGE', 'QUIZ']),
    prizeType: z.enum(['PRODUCT', 'COUPON', 'MONEY', 'OTHER']),
    prizeDescription: z.string().min(1, "Descreva o prémio"),
    prizeValue: z.preprocess((val) => Number(val), z.number().optional()), // Convert string input to number
    startDate: z.string(),
    endDate: z.string(),
    imageUrl: z.string().optional(),
    quizQuestion: z.string().optional(),
    correctAnswer: z.string().optional(),
})

export default function NewEventPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'GIVEAWAY',
            prizeType: 'PRODUCT',
            title: '',
            description: '',
            prizeDescription: '',
            // Initialize other fields
            quizQuestion: '',
            correctAnswer: '',
            prizeValue: 0
        }
    })

    const selectedType = form.watch('type')
    const selectedPrizeType = form.watch('prizeType')

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        try {
            // Validate specific logic
            if (values.type === 'QUIZ' && (!values.quizQuestion || !values.correctAnswer)) {
                toast.error("Preencha a pergunta e resposta do Quiz")
                setLoading(false)
                return
            }

            const result = await createEvent(values)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Evento criado com sucesso!")
                router.push("/dashboard/loja/eventos")
            }
        } catch (error) {
            toast.error("Erro ao criar evento")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
            <Link href="/dashboard/loja/eventos" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Voltar para Eventos
            </Link>

            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Novo Evento</h1>
                <p className="text-slate-500 mt-1">Crie um novo evento para engajar seus clientes.</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">

                {/* Type Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { id: 'GIVEAWAY', label: 'Sorteio', icon: Gift },
                        { id: 'CONTEST', label: 'Concurso', icon: Trophy },
                        { id: 'CHALLENGE', label: 'Desafio', icon: Trophy },
                        { id: 'QUIZ', label: 'Quiz', icon: Users },
                    ].map(type => (
                        <label key={type.id} className={`
              flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
              ${form.watch('type') === type.id
                                ? 'border-brand-gold bg-brand-gold/5 text-brand-gold font-bold'
                                : 'border-slate-100 text-slate-500 hover:border-slate-200'}
            `}>
                            <input
                                type="radio"
                                value={type.id}
                                {...form.register('type')}
                                className="sr-only"
                            />
                            <type.icon className="w-6 h-6" />
                            <span>{type.label}</span>
                        </label>
                    ))}
                </div>

                {/* QUIZ SPECIFIC FIELDS */}
                {selectedType === 'QUIZ' && (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Configuração do Quiz
                        </h3>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-blue-800">Pergunta do Desafio</label>
                            <input
                                {...form.register('quizQuestion')}
                                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Ex: Qual é a capital de Angola?"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-blue-800">Resposta Correta</label>
                            <input
                                {...form.register('correctAnswer')}
                                className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="Ex: Luanda"
                            />
                            <p className="text-xs text-blue-600">A resposta deve ser exata para validação automática.</p>
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Título do Evento</label>
                        <input
                            {...form.register('title')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                            placeholder="Ex: Sorteio de Natal"
                        />
                        {form.formState.errors.title && <p className="text-red-500 text-sm">{form.formState.errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Descrição e Regras</label>
                        <textarea
                            {...form.register('description')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all h-32"
                            placeholder="Descreva como participar, regras e detalhes do prémio..."
                        />
                        {form.formState.errors.description && <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>}
                    </div>
                </div>

                {/* Prize Info */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Tipo de Prémio</label>
                        <select
                            {...form.register('prizeType')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                        >
                            <option value="PRODUCT">Produto Grátis</option>
                            <option value="COUPON">Cupom Automático</option>
                            <option value="MONEY">Dinheiro (AOA)</option>
                            <option value="OTHER">Outro</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        {/* Dynamic Prize Fields */}
                        <label className="text-sm font-bold text-slate-900">
                            {selectedPrizeType === 'COUPON' ? 'Valor do Desconto (%)' :
                                selectedPrizeType === 'MONEY' ? 'Valor (Kz)' : 'Descrição do Prémio'}
                        </label>

                        {selectedPrizeType === 'COUPON' || selectedPrizeType === 'MONEY' ? (
                            <input
                                type="number"
                                {...form.register('prizeValue')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                placeholder={selectedPrizeType === 'COUPON' ? "Ex: 20" : "Ex: 5000"}
                            />
                        ) : (
                            <input
                                {...form.register('prizeDescription')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                                placeholder="Ex: iPhone 15"
                            />
                        )}

                        {/* Hidden description for Coupon/Money to satisfy schema if needed, or use effect to auto-fill? 
                            We can just use prizeDescription as metadata like 'Cupom de 20%' 
                        */}
                        {(selectedPrizeType === 'COUPON' || selectedPrizeType === 'MONEY') && (
                            <input
                                type="hidden"
                                {...form.register('prizeDescription')}
                                value={`${selectedPrizeType === 'COUPON' ? 'Cupom de ' : 'Valor de '}${form.watch('prizeValue') || 0}${selectedPrizeType === 'COUPON' ? '%' : ' Kz'}`}
                            />
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Início</label>
                        <input
                            type="datetime-local"
                            {...form.register('startDate')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-900">Fim</label>
                        <input
                            type="datetime-local"
                            {...form.register('endDate')}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-gold/20 focus:border-brand-gold transition-all"
                        />
                    </div>
                </div>

                {/* Image Upload Placeholder */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900">Imagem do Evento (Opcional)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                        <ImageIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">Clique para upload da imagem (Placeholder)</span>
                        <input
                            type="text"
                            {...form.register('imageUrl')}
                            placeholder="Cole a URL da imagem aqui por enquanto"
                            className="mt-4 w-full text-xs p-2 border rounded"
                        />
                    </div>
                </div>


                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Criando Evento...
                        </>
                    ) : (
                        'Criar Evento'
                    )}
                </button>

            </form>
        </div>
    )
}
