import { getVendorBalance, requestWithdrawal } from "./actions"
import { Wallet, TrendingUp, TrendingDown, Clock, AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function WalletPage() {
    const { balance, transactions } = await getVendorBalance()

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Minha Carteira</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-xl col-span-2">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-slate-400 font-medium mb-1">Saldo Disponível</p>
                            <h2 className="text-4xl font-black">
                                {balance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </h2>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <Wallet className="w-8 h-8 text-brand-gold" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-400" />
                            <span className="text-sm">Vendas: +{(transactions.filter(t => t.type === 'SALE' && t.status === 'COMPLETED').reduce((acc, t) => acc + Number(t.amount), 0)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-lg flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-400" />
                            <span className="text-sm">Saques: {(transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'COMPLETED').reduce((acc, t) => acc + Number(t.amount), 0)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-orange-600" />
                        Solicitar Saque
                    </h3>

                    <form action={async (formData) => {
                        "use server"
                        await requestWithdrawal(formData)
                    }} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Valor a Sacar (Kz)</label>
                            <input
                                name="amount"
                                type="number"
                                placeholder="0.00"
                                className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-bold text-lg focus:border-brand-gold focus:outline-none transition-colors"
                                min={1000}
                                max={Math.max(0, balance)}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Mínimo: 1.000 Kz</p>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">IBAN de Destino</label>
                            <input
                                name="iban"
                                placeholder="AO06..."
                                className="w-full p-3 border-2 border-gray-200 rounded-xl bg-gray-50 font-mono text-sm focus:border-brand-gold focus:outline-none transition-colors"
                                required
                            />
                        </div>
                        {balance > 0 ? (
                            <button
                                type="submit"
                                className="w-full py-4 bg-brand-gold text-white font-bold text-lg rounded-xl hover:bg-brand-dark transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl"
                            >
                                Solicitar Transferência
                            </button>
                        ) : (
                            <div className="p-4 bg-gray-100 rounded-xl text-center">
                                <p className="text-gray-500 font-medium">Saldo insuficiente para saque</p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 text-lg">Histórico de Transações</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-800 uppercase text-xs font-bold">
                            <tr>
                                <th className="px-6 py-3">Data</th>
                                <th className="px-6 py-3">Tipo</th>
                                <th className="px-6 py-3">Descrição</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold
                                            ${t.type === 'SALE' ? 'bg-green-100 text-green-700' : ''}
                                            ${t.type === 'WITHDRAWAL' ? 'bg-orange-100 text-orange-700' : ''}
                                            ${t.type === 'COMMISSION' ? 'bg-red-50 text-red-600' : ''}
                                        `}>
                                            {t.type === 'SALE' ? 'VENDA' : t.type === 'WITHDRAWAL' ? 'SAQUE' : t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                        {t.description || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`flex items-center gap-1 font-bold text-xs
                                            ${t.status === 'COMPLETED' ? 'text-green-600' : ''}
                                            ${t.status === 'PENDING' ? 'text-orange-500' : ''}
                                            ${t.status === 'REJECTED' ? 'text-red-500' : ''}
                                        `}>
                                            {t.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {t.status === 'REJECTED' && <AlertCircle className="w-3 h-3" />}
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${t.type === 'SALE' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {t.type === 'SALE' ? '+' : '-'}
                                        {Number(t.amount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400 italic">
                                        Nenhuma transação registada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
