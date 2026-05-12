"use client"

import { useEffect, useState } from "react"
import { Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"

interface Order {
    id: string
    createdAt: string
    status: string
    total: number
    user: { name: string; email: string }
    items: {
        id: string
        quantity: number
        price: number
        product: {
            name: string
            images: string
            store: { name: string }
        }
    }[]
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/admin/orders")
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data.orders)
                }
            } catch (error) {
                console.error("Failed to fetch admin orders", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando todas as encomendas...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Administração de Pedidos (Global)</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Pedido</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Cliente</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Vendedores (Lojas)</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Total</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <span className="font-bold text-gray-900 block">#{order.id.slice(-6)}</span>
                                    <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </td>
                                <td className="p-4 text-sm">
                                    <div className="font-medium text-gray-900">{order.user?.name || "Desconhecido"}</div>
                                    <div className="text-gray-500 text-xs">{order.user?.email}</div>
                                </td>
                                <td className="p-4 text-sm">
                                    {/* List stores involved in this order based on products */}
                                    <div className="flex flex-wrap gap-1">
                                        {Array.from(new Set(order.items.map(i => i.product.store?.name))).map(storeName => (
                                            <span key={storeName} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">
                                                {storeName}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-brand-dark">
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(order.total)}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1
                                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <Link href={`/admin/pedidos/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-bold underline">
                                        Detalhes
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        Nenhum pedido encontrado no sistema.
                    </div>
                )}
            </div>
        </div>
    )
}
