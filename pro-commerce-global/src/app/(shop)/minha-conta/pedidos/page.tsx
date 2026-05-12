"use client"

import { useEffect, useState } from "react"
import { Package, Upload, FileText, Check, Clock, Truck } from "lucide-react"

interface Order {
    id: string
    createdAt: string
    status: string
    total: number
    paymentMethod: string
    proofUrl?: string
    trackingCode?: string
    items: {
        id: string
        quantity: number
        price: number
        product: { name: string; images: string }
    }[]
}

export default function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [uploadingId, setUploadingId] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        try {
            const res = await fetch("/api/orders/my-orders")
            if (res.ok) {
                const data = await res.json()
                // API returns { orders: [...] }
                const ordersList = Array.isArray(data.orders) ? data.orders : (Array.isArray(data) ? data : [])
                setOrders(ordersList)
            }
        } catch (error) {
            console.error(error)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, orderId: string) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate type
        if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
            alert("Apenas imagens ou PDF são permitidos.")
            return
        }

        setUploadingId(orderId)
        const formData = new FormData()
        formData.append("file", file)

        try {
            // 1. Upload File
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (!uploadRes.ok) throw new Error("Erro no upload do arquivo")
            const { url } = await uploadRes.json()

            // 2. Update Order with Proof URL
            const updateRes = await fetch(`/api/orders/${orderId}/proof`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofUrl: url })
            })

            if (!updateRes.ok) throw new Error("Erro ao salvar comprovativo")

            alert("Comprovativo enviado com sucesso!")
            fetchOrders() // Refresh list
        } catch (error) {
            console.error(error)
            alert("Falha ao enviar comprovativo. Tente novamente.")
        } finally {
            setUploadingId(null)
        }
    }

    if (loading) return <div className="p-12 text-center text-gray-500">Carregando seus pedidos...</div>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

            {orders.length === 0 ? (
                <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Você ainda não fez nenhum pedido.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {(orders || []).map((order) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Pedido #{order.id.slice(-6).toUpperCase()}</div>
                                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    {order.trackingCode && (
                                        <div className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit">
                                            <Truck className="w-3 h-3" />
                                            <span>{order.trackingCode}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-brand-dark">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(order.total)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {order.status === 'PENDING' ? 'Pendente' :
                                            order.status === 'PAID' ? 'Pago' : order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4 mb-6">
                                    {(order.items || []).map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                                                {item.product.images && (() => {
                                                    let imgSrc = "/placeholder.png";
                                                    try {
                                                        const parsed = JSON.parse(item.product.images);
                                                        imgSrc = Array.isArray(parsed) ? parsed[0] : item.product.images;
                                                    } catch {
                                                        imgSrc = item.product.images;
                                                    }
                                                    return <img src={imgSrc} className="w-full h-full object-cover" alt={item.product.name} />;
                                                })()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">{item.quantity} x {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Proof Upload Section */}
                                {order.status === 'PENDING' && order.paymentMethod === 'MANUAL' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        {order.proofUrl ? (
                                            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg">
                                                <Check className="w-5 h-5" />
                                                <span className="text-sm font-medium">Comprovativo enviado</span>
                                                <a href={order.proofUrl} target="_blank" className="text-xs underline ml-auto">Ver arquivo</a>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">Pagamento Manual? Envie o comprovativo aqui:</p>
                                                <label className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-colors w-fit ${uploadingId === order.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <Upload className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {uploadingId === order.id ? 'Enviando...' : 'Anexar Comprovativo (PDF/IMG)'}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,application/pdf"
                                                        onChange={(e) => handleFileUpload(e, order.id)}
                                                    />
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
