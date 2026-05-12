"use client"

import { useState } from "react"
import { Wallet, CheckCircle2, FileText, CreditCard, Plus, Building2, Trash2, User, AlertCircle, Copy, Check } from "lucide-react"
import { addBankAccount, deleteBankAccount } from "@/app/actions/vendor"
import { toast } from "react-hot-toast"

interface BankAccount {
    id: string
    bankName: string
    iban: string
    holderName: string
}

interface FinancialSettingsProps {
    storeStatus: string
    adminPaymentInfo?: string | null
    bankAccounts: BankAccount[]
}

export default function FinancialSettings({ bankAccounts }: FinancialSettingsProps) {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [newAccount, setNewAccount] = useState({
        bankName: "",
        iban: "",
        holderName: ""
    })

    const handleAdd = async () => {
        if (!newAccount.bankName || !newAccount.iban || !newAccount.holderName) {
            toast.error("Preencha todos os campos")
            return
        }
        setLoading(true)
        try {
            const res = await addBankAccount(newAccount)
            if (res.success) {
                toast.success("Conta adicionada com sucesso!")
                setNewAccount({ bankName: "", iban: "", holderName: "" })
                setIsFormOpen(false)
            } else {
                toast.error("Erro ao adicionar conta")
            }
        } catch (e) {
            toast.error("Erro inesperado")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover esta conta?")) return
        try {
            const res = await deleteBankAccount(id)
            if (res.success) toast.success("Conta removida")
            else toast.error("Erro ao remover")
        } catch (e) {
            toast.error("Erro inesperado")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Configurações Financeiras</h1>
                <p className="text-slate-500">Gerencie seus dados de pagamento e recebimento.</p>
            </div>



            {/* Receiving Accounts Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            Contas de Recebimento
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Contas bancárias onde você receberá seus pagamentos.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nova Conta
                    </button>
                </div>

                <div className="p-6">
                    {bankAccounts.length === 0 ? (
                        <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-500 font-medium">Nenhuma conta cadastrada</p>
                            <p className="text-sm text-slate-400 mt-1">Adicione uma conta para receber seus pagamentos.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {bankAccounts.map(acc => (
                                <div key={acc.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all group relative">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg">
                                            <Building2 className="w-4 h-4 text-slate-600" />
                                            <span className="text-xs font-bold text-slate-700 uppercase">{acc.bankName}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(acc.id)}
                                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">IBAN</p>
                                            <p className="font-mono text-sm font-medium text-slate-800 break-all">{acc.iban}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">TITULAR</p>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-slate-400" />
                                                <p className="text-sm text-slate-700 font-medium truncate">{acc.holderName}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Account Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Nova Conta Bancária</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome do Banco</label>
                                <input
                                    value={newAccount.bankName}
                                    onChange={e => setNewAccount({ ...newAccount, bankName: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm font-medium placeholder:text-slate-300"
                                    placeholder="Ex: Banco BAI"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">IBAN</label>
                                <input
                                    value={newAccount.iban}
                                    onChange={e => setNewAccount({ ...newAccount, iban: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm font-medium font-mono placeholder:text-slate-300"
                                    placeholder="AO06..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nome do Titular</label>
                                <input
                                    value={newAccount.holderName}
                                    onChange={e => setNewAccount({ ...newAccount, holderName: e.target.value })}
                                    className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-brand-gold focus:ring-0 outline-none transition-colors text-sm font-medium placeholder:text-slate-300"
                                    placeholder="Nome completo do titular"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAdd}
                                disabled={loading}
                                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 disabled:opacity-50"
                            >
                                {loading ? "Salvando..." : "Salvar Conta"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
