
import { ArrowUpRight, ArrowDownLeft, Store } from "lucide-react"

export function TransactionLedger({ transactions }: { transactions: any[] }) {
    if (transactions.length === 0) {
        return <p className="text-center py-8 text-gray-400 italic">Nenhuma transação registada.</p>
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                    <tr>
                        <th className="px-4 py-3">Data</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Descrição</th>
                        <th className="px-4 py-3">Valor</th>
                        <th className="px-4 py-3">Origem</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${tx.type === 'SALE' ? 'bg-green-100 text-green-700' :
                                    tx.type === 'COMMISSION' ? 'bg-blue-100 text-blue-700' :
                                        tx.type === 'REFUND' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {tx.type}
                                </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{tx.description || "N/A"}</td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-1 font-mono font-bold">
                                    {tx.type === 'REFUND' || tx.type === 'WITHDRAWAL' ?
                                        <ArrowUpRight className="w-3 h-3 text-red-500" /> :
                                        <ArrowDownLeft className="w-3 h-3 text-green-500" />
                                    }
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: tx.currency }).format(Number(tx.amount))}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-xs">
                                {tx.user?.email || tx.reference || "Sistema"}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`w-2 h-2 rounded-full inline-block mr-2 ${tx.status === 'COMPLETED' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                {tx.status}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
