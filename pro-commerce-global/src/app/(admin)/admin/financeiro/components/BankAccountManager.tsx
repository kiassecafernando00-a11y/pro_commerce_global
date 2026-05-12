
"use client"

import { useState } from "react"
import { addBankAccount, deleteBankAccount, toggleBankAccount } from "../actions"
import { Plus, Trash2, Power, PowerOff, Building } from "lucide-react"

export function BankAccountManager({ accounts }: { accounts: any[] }) {
    const [isAdding, setIsAdding] = useState(false)

    return (
        <div className="space-y-4">
            {/* List */}
            <div className="space-y-3">
                {accounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${acc.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{acc.bankName} ({acc.currency})</p>
                                <p className="text-sm text-gray-500">{acc.holderName} • {acc.iban || acc.accountNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => await toggleBankAccount(acc.id, acc.isActive)}
                                className="p-2 text-gray-500 hover:text-gray-800 transition-colors"
                                title={acc.isActive ? "Desativar" : "Ativar"}
                            >
                                {acc.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4 text-red-500" />}
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm("Tem certeza que deseja apagar esta conta?")) await deleteBankAccount(acc.id)
                                }}
                                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {accounts.length === 0 && (
                    <p className="text-center text-gray-400 py-4 italic">Nenhuma conta bancária configurada.</p>
                )}
            </div>

            {/* Add Form */}
            {isAdding ? (
                <form action={async (formData) => {
                    await addBankAccount(formData)
                    setIsAdding(false)
                }} className="bg-gray-100 p-4 rounded-xl space-y-3 mt-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-gray-700">Adicionar Nova Conta</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="bankName" placeholder="Nome do Banco (ex: BAI)" className="p-2 rounded border border-gray-300 w-full" required />
                        <select name="currency" className="p-2 rounded border border-gray-300 w-full">
                            <option value="AOA">Kwanza (AOA)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>
                    <input name="holderName" placeholder="Nome do Titular" className="p-2 rounded border border-gray-300 w-full" required />
                    <input name="iban" placeholder="IBAN ou Nº da Conta" className="p-2 rounded border border-gray-300 w-full" required />
                    <input name="instructions" placeholder="Instruções (Opcional)" className="p-2 rounded border border-gray-300 w-full" />

                    <div className="flex gap-2 justify-end">
                        <button type="button" onClick={() => setIsAdding(false)} className="bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-bold">Cancelar</button>
                        <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg text-white font-bold hover:bg-blue-700">Salvar Conta</button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-3 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-500 font-bold rounded-xl hover:bg-gray-100 hover:border-gray-400 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Adicionar Conta Bancária
                </button>
            )}
        </div>
    )
}
