"use client"

import { useState } from "react"
import { Save, AlertCircle, Percent, Banknote } from "lucide-react"
import { updateFinanceSettings } from "@/app/actions/admin/finance-settings"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface FinanceSettingsProps {
    initialData: {
        vendorRegistrationFee: number
        platformFeePercent: number
        withdrawalFeePercent: number
        adminPaymentInfo?: string | null
    }
}

export default function FinanceSettingsForm({ initialData }: FinanceSettingsProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        ...initialData,
        adminPaymentInfo: initialData.adminPaymentInfo || ""
    })

    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateFinanceSettings({
                ...formData,
                vendorRegistrationFee: Number(formData.vendorRegistrationFee),
                platformFeePercent: Number(formData.platformFeePercent),
                withdrawalFeePercent: Number(formData.withdrawalFeePercent)
            })

            if (res.success) {
                toast.success("Configurações atualizadas!")
                router.refresh()
            } else {
                toast.error("Erro ao atualizar")
            }
        } catch (error) {
            toast.error("Erro inesperado")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Banknote className="w-6 h-6 text-brand-gold" />
                    Taxas e Comissões
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Registration Fee */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 block">Taxa de Inscrição (Kz)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={formData.vendorRegistrationFee}
                                onChange={(e) => setFormData({ ...formData, vendorRegistrationFee: Number(e.target.value) })}
                                className="w-full pl-4 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-brand-gold outline-none font-medium"
                            />
                        </div>
                        <p className="text-xs text-slate-400">Valor fixo pago por novos vendedores.</p>
                    </div>

                    {/* Sales Commission */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 block">Comissão de Venda (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.platformFeePercent}
                                onChange={(e) => setFormData({ ...formData, platformFeePercent: Number(e.target.value) })}
                                className="w-full pl-4 pr-10 py-2 border-2 border-slate-200 rounded-lg focus:border-brand-gold outline-none font-medium"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400">Percentual retido de cada venda.</p>
                    </div>

                    {/* Withdrawal Fee */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-600 block">Taxa de Saque (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.withdrawalFeePercent}
                                onChange={(e) => setFormData({ ...formData, withdrawalFeePercent: Number(e.target.value) })}
                                className="w-full pl-4 pr-10 py-2 border-2 border-slate-200 rounded-lg focus:border-brand-gold outline-none font-medium"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400">Percentual cobrado ao solicitar saque.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                    Dados de Recebimento (Admin)
                </h2>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 block">Coordenadas Bancárias / Instruções</label>
                    <textarea
                        value={formData.adminPaymentInfo}
                        onChange={(e) => setFormData({ ...formData, adminPaymentInfo: e.target.value })}
                        className="w-full p-4 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none min-h-[150px] font-mono text-sm"
                        placeholder="Insira aqui o IBAN, Nome do Banco e Beneficiário para onde o vendedor deve transferir as taxas..."
                    />
                    <p className="text-xs text-slate-400">Esta informação será exibida para o vendedor na área de pagamentos.</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {loading ? "Salvando..." : "Salvar Configurações"}
                </button>
            </div>
        </form>
    )
}
