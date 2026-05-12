"use client"

import { useState } from "react"
import { Wallet, Info, UploadCloud, CheckCircle2, AlertTriangle, Clock, ArrowUpRight } from "lucide-react"
import { uploadPaymentProof } from "@/app/actions/finance"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface VendorPaymentsProps {
    store: {
        status: string
        commissionDebt: number
        debtDueDate?: Date | null
        isSuspended: boolean
        subscriptionStatus: string // ACTIVE, INACTIVE, OVERDUE
        subscriptionDueDate?: Date | null
    }
    adminPaymentInfo?: string | null
}

export default function VendorPayments({ store, adminPaymentInfo }: VendorPaymentsProps) {
    const [uploading, setUploading] = useState(false)
    const [selectedType, setSelectedType] = useState<'REGISTRATION_FEE' | 'COMMISSION' | 'WITHDRAWAL_FEE' | 'SUBSCRIPTION' | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [amount, setAmount] = useState("")

    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!selectedType || !file || !amount) {
            toast.error("Preencha todos os campos e selecione o arquivo")
            return
        }

        setUploading(true)
        try {
            // 1. Upload Image
            const formData = new FormData()
            formData.append("file", file)

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            const uploadData = await uploadRes.json()
            if (!uploadRes.ok) throw new Error(uploadData.error || "Erro no upload")

            // 2. Submit Proof
            const res = await uploadPaymentProof({
                type: selectedType,
                amount: Number(amount),
                imageUrl: uploadData.url
            })

            if (res.success) {
                toast.success("Comprovante enviado com sucesso! Aguarde a aprovação.")
                setSelectedType(null)
                setFile(null)
                setAmount("")
                router.refresh()
            } else {
                toast.error(res.error || "Erro ao enviar comprovante")
            }

        } catch (error) {
            console.error(error)
            toast.error("Erro ao processar envio")
        } finally {
            setUploading(false)
        }
    }



    const isSubscriptionActive = store.subscriptionStatus === 'ACTIVE'
    const daysOverdue = store.debtDueDate ? Math.ceil((new Date().getTime() - new Date(store.debtDueDate).getTime()) / (1000 * 3600 * 24)) : 0

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Pagamentos à Plataforma</h1>
                <p className="text-slate-500">Regularize taxas e comissões para manter sua loja ativa.</p>
            </div>

            {/* Warning Banner */}
            {store.isSuspended && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4">
                    <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
                    <div>
                        <h3 className="text-red-800 font-bold text-lg">Atividades Suspensas</h3>
                        <p className="text-red-700">
                            Sua loja está suspensa devido a pendências financeiras. Realize o pagamento imediato para restabelecer o acesso.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Monthly Subscription Card */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${store.subscriptionStatus === 'ACTIVE'
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-brand-gold shadow-lg shadow-brand-gold/10'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-dark">
                            <Clock className="w-6 h-6" />
                        </div>
                        {store.subscriptionStatus === 'ACTIVE' ? (
                            <div className="text-right">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center justify-end gap-1 mb-1">
                                    <CheckCircle2 className="w-3 h-3" /> ATIVO
                                </span>
                                {store.subscriptionDueDate && (
                                    <p className="text-xs text-slate-500 font-medium">
                                        Vence em: {new Date(store.subscriptionDueDate).toLocaleDateString('pt-AO')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> PENDENTE
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">Mensalidade</h3>
                    <p className="text-slate-500 text-sm mb-6">Assinatura mensal para manter sua loja online.</p>

                    {store.subscriptionStatus !== 'ACTIVE' && (
                        <button
                            onClick={() => {
                                setSelectedType('SUBSCRIPTION') // Reuse type or map to SUBSCRIPTION in backend
                                setAmount("5000")
                            }}
                            className="w-full bg-brand-gold text-brand-dark py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
                        >
                            Pagar Mensalidade
                        </button>
                    )}
                </div>

                {/* 2. Commission Debt Card */}
                <div className={`p-6 rounded-2xl border-2 transition-all ${store.commissionDebt <= 0
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-red-200 shadow-lg shadow-red-500/5'
                    }`}>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${store.commissionDebt > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        {store.commissionDebt > 0 && store.debtDueDate && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${daysOverdue > 0 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {daysOverdue > 0 ? `ATRASADO ${daysOverdue} DIAS` : 'A VENCER'}
                            </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">Dívida de Comissões</h3>
                    <p className="text-3xl font-black text-slate-900 mb-2">
                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(store.commissionDebt)}
                    </p>
                    <p className="text-slate-500 text-sm mb-6">Valor acumulado das comissões de vendas.</p>

                    {store.commissionDebt > 0 && (
                        <button
                            onClick={() => {
                                setSelectedType('COMMISSION')
                                setAmount(String(store.commissionDebt))
                            }}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Regularizar
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Info Box */}
            <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Dados para Transferência
                </h4>
                {adminPaymentInfo ? (
                    <pre className="font-mono text-sm text-slate-600 whitespace-pre-wrap">{adminPaymentInfo}</pre>
                ) : (
                    <p className="text-slate-500 italic">Contate o suporte para obter dados bancários.</p>
                )}
            </div>

            {/* Upload Modal */}
            {selectedType && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-xl font-bold mb-4">
                            Enviar Comprovante - {
                                selectedType === 'REGISTRATION_FEE' ? 'Taxa de Inscrição' :
                                    selectedType === 'SUBSCRIPTION' ? 'Mensalidade' :
                                        selectedType === 'COMMISSION' ? 'Comissão' :
                                            'Taxa de Saque'
                            }
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Valor Pago</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2 outline-none focus:border-brand-gold"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Comprovante (Imagem/PDF)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*,application/pdf"
                                    />
                                    {file ? (
                                        <p className="text-green-600 font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" /> {file.name}
                                        </p>
                                    ) : (
                                        <div className="text-slate-400">
                                            <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                                            <p className="text-sm">Clique para selecionar o arquivo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => {
                                    setSelectedType(null)
                                    setFile(null)
                                }}
                                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={uploading}
                                className="flex-1 bg-brand-gold text-brand-dark font-bold py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                            >
                                {uploading ? "Enviando..." : "Enviar Comprovante"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
