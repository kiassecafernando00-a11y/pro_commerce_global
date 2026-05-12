"use client"
// Force Refresh 2024-12-21


import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from "lucide-react"
import Link from "next/link"

interface Order {
    id: string
    createdAt: string
    status: string
    trackingCode?: string
    total: number
    items: {
        id: string
        quantity: number
        price: number
        product: {
            name: string
            images: string
        }
    }[]
}

// function safeParseImages removed


export default function MyOrdersPage() {
    const { data: session } = useSession()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            if (session?.user) {
                try {
                    const res = await fetch('/api/orders/my-orders')
                    if (res.ok) {
                        const data = await res.json()
                        console.log("Fetched orders:", data)
                        setOrders(Array.isArray(data.orders) ? data.orders : [])
                    } else {
                        console.error("Orders fetch failed", await res.text())
                        setOrders([])
                    }
                } catch (error) {
                    console.error("Failed to fetch orders", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchOrders()
    }, [session])

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h2>
                        <p className="text-gray-500 mb-6">Faça login para ver as suas compras.</p>
                        <Link href="/auth/login" className="bg-brand-gold text-brand-dark px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                            Entrar na Conta
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">


            <main className="container mx-auto px-6 py-12 flex-grow">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Compras</h1>
                <p className="text-gray-500 mb-8">Acompanhe o estado das suas encomendas.</p>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Sem encomendas ainda</h3>
                        <p className="text-gray-500 mb-6">Aproveite para explorar os nossos produtos!</p>
                        <Link href="/produtos" className="text-blue-600 font-bold hover:underline">Ver Produtos</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {(Array.isArray(orders) ? orders : []).map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Pedido #{order.id.slice(-6)}</span>
                                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        {order.trackingCode && (
                                            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                                <Truck className="w-3 h-3" />
                                                <span>Rastreio: {order.trackingCode}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2
                                    ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                order.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                                                    order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                            }`}>
                                            {order.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                            {order.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                                            {order.status === 'SHIPPED' && <Truck className="w-3 h-3" />}
                                            {order.status === 'DELIVERED' && <CheckCircle className="w-3 h-3" />}
                                            {order.status === 'CANCELLED' && <XCircle className="w-3 h-3" />}
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(order.items || []).map((item) => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {item.product.images && (() => {
                                                    // Ultra-safe image parsing
                                                    let imgSrc = "/placeholder.png";
                                                    const raw = item.product.images;
                                                    try {
                                                        // Attempt to parse as JSON first
                                                        const parsed = JSON.parse(raw);
                                                        if (Array.isArray(parsed)) imgSrc = parsed[0];
                                                        else imgSrc = raw;
                                                    } catch (e) {
                                                        // Fallback to raw string if parse fails
                                                        imgSrc = raw;
                                                    }
                                                    return <img src={imgSrc} alt={item.product.name} className="w-full h-full object-cover" />;
                                                })()}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-sm">{item.product.name}</h4>
                                                <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                            <span className="font-bold text-gray-900 text-sm">
                                                {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-sm font-medium">Total do Pedido</span>
                                        <span className="text-xl font-bold text-brand-dark">
                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(order.total)}
                                        </span>
                                    </div>

                                    {order.status === 'PENDING' && (
                                        <Link href={`/pedido/${order.id}/pagamento`} className="w-full sm:w-auto bg-brand-gold text-brand-dark px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all text-center flex items-center justify-center gap-2">
                                            <span>Pagar / Enviar Comprovativo</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
