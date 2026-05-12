"use client"

import { useEffect, useState } from "react"
import { Truck, CheckCircle, Clock, Search, Filter, AlertCircle, DollarSign, MapPin, MessageCircle, Package, ChevronDown, FileText, X } from "lucide-react"
import dynamic from "next/dynamic"

const LocationMap = dynamic(() => import("@/components/checkout/LocationMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Carregando Mapa...</div>
})

// Helper for safe image parsing
function safeParseImages(images: string): string[] {
    if (!images) return []
    try {
        const parsed = JSON.parse(images)
        if (Array.isArray(parsed)) return parsed
        return [images]
    } catch {
        return [images]
    }
}

import { approveVendorOrderPayment } from "@/app/actions/vendor/orders"

interface Order {
    id: string
    createdAt: string
    status: string
    total: number
    user: { name: string; email: string }
    address: string // JSON string
    proofUrl?: string
    latitude?: number
    longitude?: number
    items: {
        id: string
        quantity: number
        price: number
        product: { name: string; images: string }
    }[]
}

export default function VendorOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [selectedOrderLocation, setSelectedOrderLocation] = useState<{ lat: number, lng: number } | null>(null)

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await fetch("/api/dashboard/orders")
                if (res.ok) {
                    const data = await res.json()
                    setOrders(data.orders)
                }
            } catch (error) {
                console.error("Failed to fetch orders", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    // --- Statistics Calculations ---
    const totalRevenue = orders.reduce((acc, order) => {
        // Calculate only the revenue for THIS vendor's items in the order
        // This logic mimics the API's responsibility but simplified for stats for now
        // For accurate revenue, we should sum item.price * item.quantity for logic match
        const orderVendorTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
        return ['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) ? acc + orderVendorTotal : acc
    }, 0)

    const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length
    const completedOrdersCount = orders.filter(o => o.status === 'DELIVERED').length

    // --- Filtering ---
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const statusColors: any = {
        PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
        VERIFYING: "bg-orange-100 text-orange-700 border-orange-200", // New status
        PAID: "bg-blue-100 text-blue-700 border-blue-200",
        SHIPPED: "bg-purple-100 text-purple-700 border-purple-200",
        DELIVERED: "bg-green-100 text-green-700 border-green-200",
        CANCELLED: "bg-red-100 text-red-700 border-red-200",
    }

    const statusLabels: any = {
        PENDING: "Pendente",
        VERIFYING: "Em Análise", // New Label
        PAID: "Pago / A Enviar",
        SHIPPED: "Enviado",
        DELIVERED: "Entregue",
        CANCELLED: "Cancelado",
    }

    async function handleApprovePayment(orderId: string) {
        if (!confirm("Tem certeza que deseja confirmar o pagamento deste pedido?")) return

        try {
            const res = await approveVendorOrderPayment(orderId)
            if (res.success) {
                // Optimistic update
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "PAID" } : o))
                alert("Pagamento confirmado com sucesso!")
            } else {
                alert("Erro ao confirmar pagamento: " + res.error)
            }
        } catch (error) {
            console.error(error)
            alert("Erro ao processar solicitação.")
        }
    }

    async function handleStatusUpdate(orderId: string, newStatus: string) {
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

        try {
            const res = await fetch(`/api/dashboard/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            })

            if (!res.ok) {
                throw new Error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            alert("Erro ao atualizar status. Tente novamente.")
            // Revert changes on error (could require fetching again or storing previous state, but simply refreshing is safer)
            window.location.reload()
        }
    }

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center animate-pulse">
                    <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Carregando seus pedidos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Title */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Vendas</h1>
                <p className="text-gray-500 mt-1">Acompanhe e gerencie todos os pedidos da sua loja.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Faturamento Total</p>
                        <h3 className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(totalRevenue)}
                        </h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Pedidos Pendentes</p>
                        <h3 className="text-2xl font-black text-gray-900">{pendingOrdersCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Entregas Concluídas</p>
                        <h3 className="text-2xl font-black text-gray-900">{completedOrdersCount}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {["ALL", "PENDING", "VERIFYING", "PAID", "SHIPPED", "DELIVERED"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${statusFilter === status
                                ? "bg-brand-gold text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {status === "ALL" ? "Todos" : statusLabels[status]}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por ID, Cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-brand-gold outline-none transition-all"
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Nenhum pedido encontrado</h3>
                        <p className="text-gray-500">Tente mudar os filtros ou aguarde novas vendas.</p>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        // Calculate total specific to this vendor's items
                        const vendorTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
                        let addressObj: any = {}
                        try {
                            addressObj = JSON.parse(order.address || "{}")
                        } catch (e) { }

                        return (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                {/* Card Header */}
                                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido</span>
                                            <span className="font-bold text-gray-900">#{order.id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data</span>
                                            <span className="text-sm text-gray-700 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString("pt-AO", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide flex items-center gap-2 ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}>
                                        <span className="w-2 h-2 rounded-full bg-current"></span>
                                        {statusLabels[order.status] || order.status}
                                    </div>
                                </div>

                                {/* Order Content */}
                                <div className="p-6 grid lg:grid-cols-3 gap-8">
                                    {/* Items Column */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                            <Package className="w-4 h-4 text-brand-gold" />
                                            Itens do Pedido
                                        </h4>
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                                                    {item.product.images ? (
                                                        <img src={safeParseImages(item.product.images)[0] || "/placeholder.png"} className="w-full h-full object-cover" alt={item.product.name} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Package className="w-6 h-6" /></div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900 text-sm line-clamp-2">{item.product.name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">Qty: {item.quantity}</span>
                                                        <span className="text-sm font-bold text-brand-gold">
                                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(item.price))}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(item.price) * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="space-y-6 lg:border-l lg:border-gray-100 lg:pl-6">
                                        {/* Customer */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cliente</h4>
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {(order.user?.name || "C")[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{order.user?.name}</p>
                                                    <p className="text-xs text-gray-500 break-all">{order.user?.email}</p>

                                                    {/* Contact Action */}
                                                    {addressObj.phone && (
                                                        <a
                                                            href={`https://wa.me/${addressObj.phone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600 mt-2 hover:underline"
                                                        >
                                                            <MessageCircle className="w-3 h-3" />
                                                            Contatar no WhatsApp
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Entrega</h4>
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <p>
                                                    <span className="block text-xs">{addressObj.street}</span>
                                                    <span className="block text-xs text-gray-500">{addressObj.phone}</span>
                                                </p>
                                            </div>
                                            {(order.latitude && order.longitude) && (
                                                <button
                                                    onClick={() => setSelectedOrderLocation({ lat: order.latitude!, lng: order.longitude! })}
                                                    className="mt-3 text-xs font-bold text-brand-gold hover:text-yellow-600 flex items-center gap-1 transition-colors"
                                                >
                                                    <MapPin className="w-3 h-3" />
                                                    Ver Localização no Mapa
                                                </button>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600 font-medium">Total do Pedido</span>
                                                <span className="text-xl font-black text-gray-900">
                                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(vendorTotal)}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="space-y-3 mt-4">
                                                {/* Confirm Payment Button (Only if Verifying or Proof exists) */}
                                                {(order.status === "VERIFYING" || (order.status === "PENDING" && order.proofUrl)) && (
                                                    <button
                                                        onClick={() => handleApprovePayment(order.id)}
                                                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors shadow-sm"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Confirmar Pagamento
                                                    </button>
                                                )}

                                                <select
                                                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-gold focus:border-brand-gold block p-2.5 font-bold cursor-pointer hover:bg-white transition-colors"
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                >
                                                    <option value="PENDING">Status: Pendente</option>
                                                    <option value="VERIFYING">Status: Em Análise</option>
                                                    <option value="PAID">Status: Pago / A Enviar</option>
                                                    <option value="SHIPPED">Status: Enviado</option>
                                                    <option value="DELIVERED">Status: Entregue</option>
                                                </select>
                                            </div>

                                            {order.proofUrl && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 font-medium">Comprovativo de Pagamento</span>
                                                    <a
                                                        href={order.proofUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded border border-blue-100"
                                                    >
                                                        <FileText className="w-3 h-3" />
                                                        Abrir Anexo
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
            {/* Map Modal stays the same */}
            {
                selectedOrderLocation && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden relative">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-brand-gold" />
                                    Localização da Entrega
                                </h3>
                                <button
                                    onClick={() => setSelectedOrderLocation(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-4 bg-gray-100">
                                <LocationMap
                                    initialLat={selectedOrderLocation.lat}
                                    initialLng={selectedOrderLocation.lng}
                                    readOnly={true}
                                />
                            </div>
                            <div className="p-4 border-t border-gray-100 text-right">
                                <button
                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedOrderLocation.lat},${selectedOrderLocation.lng}`, '_blank')}
                                    className="text-sm font-bold text-blue-600 hover:underline mr-4"
                                >
                                    Abrir no Google Maps
                                </button>
                                <button
                                    onClick={() => setSelectedOrderLocation(null)}
                                    className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-800"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
