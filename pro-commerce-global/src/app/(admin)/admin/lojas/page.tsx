"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Store, Trash2, Eye } from "lucide-react"
import StoreApprovalModal from "@/components/admin/StoreApprovalModal"

interface AdminStore {
    id: string
    name: string
    status: string // PENDING, APPROVED, REJECTED, BANNED
    user: {
        name: string
        email: string
    }
    _count: {
        products: number
    }
    vendorType: string
    registrationFeeProof?: string | null
}

export default function AdminStoresPage() {
    const [stores, setStores] = useState<AdminStore[]>([])
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<"PENDING" | "APPROVED">("APPROVED")
    const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchStores()
    }, [])

    async function fetchStores() {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/stores")
            const data = await res.json()
            if (data.stores) setStores(data.stores)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleStatusChange(storeId: string, newStatus: string) {
        if (!confirm(`Tem certeza que deseja mudar o status para ${newStatus}?`)) return

        try {
            const res = await fetch("/api/admin/stores", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ storeId, status: newStatus })
            })

            if (res.ok) {
                fetchStores()
            }
        } catch (error) {
            console.error(error)
            alert("Erro ao atualizar status.")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Isto apagará a loja e TODOS os produtos. Confirmar?")) return
        const res = await fetch(`/api/admin/stores?id=${id}`, { method: "DELETE" })
        if (res.ok) setStores(stores.filter(s => s.id !== id))
    }

    const filteredStores = stores.filter(s => {
        if (tab === "PENDING") return s.status === "PENDING"
        return s.status === "APPROVED" || s.status === "BANNED" || !s.status // Treating undefined as approved/old
    })

    if (loading) return <div className="p-8">Carregando...</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Lojas</h1>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200">
                    <button
                        onClick={() => setTab("APPROVED")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "APPROVED" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Lojas Ativas
                    </button>
                    <button
                        onClick={() => setTab("PENDING")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "PENDING" ? "bg-yellow-50 text-yellow-700" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        Pendentes ({stores.filter(s => s.status === "PENDING").length})
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Loja</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Origem</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Dono</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredStores.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                    Nenhuma loja encontrada nesta categoria.
                                </td>
                            </tr>
                        ) : (
                            filteredStores.map(store => (
                                <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-gray-900">{store.name}</div>
                                        <div className="text-xs text-gray-500">ID: {store.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${store.vendorType === 'INTERNATIONAL'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {store.vendorType === 'INTERNATIONAL' ? 'INTERNACIONAL' : 'NACIONAL'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-gray-900">{store.user.name}</div>
                                        <div className="text-xs text-gray-500">{store.user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${store.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                store.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    store.status === 'BANNED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {store.status || "APPROVED"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {store.status === "PENDING" && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStore(store)
                                                        setIsModalOpen(true)
                                                    }}
                                                    className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 font-semibold transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> Ver Comprovativo
                                                </button>

                                            </>
                                        )}
                                        {store.status === "APPROVED" && (
                                            <button
                                                onClick={() => handleStatusChange(store.id, "BANNED")}
                                                className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                                            >
                                                <XCircle className="w-4 h-4" /> Banir
                                            </button>
                                        )}
                                        {store.status === "BANNED" && (
                                            <button
                                                onClick={() => handleStatusChange(store.id, "APPROVED")}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Reativar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(store.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Apagar permanentemente"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <StoreApprovalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                store={selectedStore}
                onApprove={(id) => handleStatusChange(id, "APPROVED")}
                onReject={(id) => handleStatusChange(id, "REJECTED")}
            />
        </div>
    )
}
