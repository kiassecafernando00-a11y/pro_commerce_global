"use client"

import { useState } from "react"
import { Check, X, Search, FileText, Calendar, ExternalLink } from "lucide-react"
import { reviewPaymentProof } from "@/app/actions/finance"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface PaymentProof {
    id: string
    type: string
    amount: number
    imageUrl: string
    status: string
    createdAt: Date
    store: {
        name: string
        commissionDebt: number
    }
}

interface AdminApprovalsProps {
    proofs: PaymentProof[]
}

export default function AdminApprovals({ proofs }: AdminApprovalsProps) {
    const [processingId, setProcessingId] = useState<string | null>(null)
    const router = useRouter()

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Tem certeza que deseja ${action === 'APPROVE' ? 'APROVAR' : 'REJEITAR'} este pagamento?`)) return

        setProcessingId(id)
        try {
            const res = await reviewPaymentProof(id, action)
            if (res.success) {
                toast.success(`Pagamento ${action === 'APPROVE' ? 'aprovado' : 'rejeitado'} com sucesso!`)
                router.refresh()
            } else {
                toast.error(res.error || "Erro ao processar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Aprovações Pendentes</h1>
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                    {proofs.length} pendentes
                </span>
            </div>

            {proofs.length === 0 ? (
                <div className="bg-white p-12 rounded-xl text-center shadow-sm border border-slate-200">
                    <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 text-lg">Nenhum comprovante pendente de análise.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {proofs.map(proof => (
                        <div key={proof.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6">
                            {/* Image Preview */}
                            <div className="w-full md:w-48 h-48 bg-slate-100 rounded-lg overflow-hidden relative shrink-0">
                                <img
                                    src={proof.imageUrl}
                                    alt="Comprovante"
                                    className="w-full h-full object-cover"
                                />
                                <a
                                    href={proof.imageUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-lg text-slate-700 hover:text-blue-600 shadow-sm"
                                    title="Ver Imagem Original"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{proof.store.name}</h3>
                                        <p className="text-slate-500 text-sm flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(proof.createdAt).toLocaleDateString('pt-AO')} às {new Date(proof.createdAt).toLocaleTimeString('pt-AO')}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${proof.type === 'REGISTRATION_FEE' ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {proof.type === 'REGISTRATION_FEE' ? 'TAXA DE INSCRIÇÃO' : 'COMISSÃO'}
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Valor Declarado</p>
                                    <p className="text-2xl font-black text-slate-800">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(proof.amount)}
                                    </p>

                                    {proof.type === 'COMMISSION' && (
                                        <p className="text-xs text-red-500 mt-1 font-medium">
                                            Dívida Atual da Loja: {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(proof.store.commissionDebt)}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(proof.id, 'REJECT')}
                                        disabled={processingId === proof.id}
                                        className="flex-1 border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" /> Rejeitar
                                    </button>
                                    <button
                                        onClick={() => handleAction(proof.id, 'APPROVE')}
                                        disabled={processingId === proof.id}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-600/20 disabled:opacity-50"
                                    >
                                        <Check className="w-4 h-4" /> Aprovar Pagamento
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
