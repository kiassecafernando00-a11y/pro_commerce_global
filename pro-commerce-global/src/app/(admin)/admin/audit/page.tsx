import { prisma } from "@/lib/prisma"
import { ShieldAlert, Search } from "lucide-react"

async function getAuditLogs() {
    return await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    })
}

export default async function AuditPage() {
    const logs = await getAuditLogs()

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Auditoria e Segurança</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-2 items-center text-sm text-gray-500">
                    <ShieldAlert className="w-4 h-4" />
                    Mostrando últimos 50 eventos do sistema.
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Admin</th>
                            <th className="px-6 py-3">Ação</th>
                            <th className="px-6 py-3">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td className="px-6 py-3 font-bold text-gray-900">
                                    {log.actorEmail}
                                </td>
                                <td className="px-6 py-3">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-gray-600 font-mono text-xs max-w-md truncate">
                                    {log.details}
                                </td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">
                                    Nenhum registo de auditoria encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
