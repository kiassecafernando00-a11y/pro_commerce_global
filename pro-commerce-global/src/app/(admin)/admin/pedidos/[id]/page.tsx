import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { addOrderEvent } from "@/app/actions/admin/orders"
import Link from "next/link"
import { ArrowLeft, Box, Truck, MapPin, Calendar, CreditCard, User, CheckCircle2 } from "lucide-react"

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            items: {
                include: {
                    product: true
                }
            },
            events: {
                orderBy: {
                    createdAt: 'desc'
                }
            }
        }
    })

    if (!order) {
        notFound()
    }

    const helpers = {
        formatPrice: (amount: number) => {
            return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(amount)
        },
        formatDate: (date: Date) => {
            return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(date)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/pedidos" className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Pedido #{order.id.slice(-6).toUpperCase()}</h1>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> {helpers.formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                        {order.status}
                    </span>
                    {order.trackingCode && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {order.trackingCode}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Left) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Items Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Box className="w-5 h-5 text-blue-600" /> Itens do Pedido
                        </h2>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {/* Placeholder for now if no image */}
                                        <Box className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-800">{item.product.name}</h3>
                                        <p className="text-sm text-slate-500">Qtd: {item.quantity} x {helpers.formatPrice(Number(item.price))}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{helpers.formatPrice(Number(item.price) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Subtotal</span>
                                <span>{helpers.formatPrice(Number(order.total) - Number(order.deliveryFee))}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-500">
                                <span>Taxa de Entrega</span>
                                <span>{helpers.formatPrice(Number(order.deliveryFee))}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-slate-900 pt-2">
                                <span>Total</span>
                                <span>{helpers.formatPrice(Number(order.total))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline & Tracking */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-purple-600" /> Rastreio & Eventos
                            </h2>
                            {/* Add Event Form Trigger (Simple detailed form below) */}
                        </div>

                        {/* Add Event Form */}
                        <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-200">
                            <h3 className="text-sm font-bold text-slate-700 mb-3 block">Adicionar Novo Evento</h3>
                            <form action={async (formData) => {
                                "use server"
                                await addOrderEvent(formData)
                            }} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <input type="hidden" name="orderId" value={order.id} />

                                <select name="status" className="p-2 rounded-lg border border-slate-300 text-sm font-medium">
                                    <option value="PREPARING">Em Preparação</option>
                                    <option value="SHIPPED">Enviado</option>
                                    <option value="IN_TRANSIT">Em Trânsito</option>
                                    <option value="OUT_FOR_DELIVERY">Saiu para Entrega</option>
                                    <option value="DELIVERED">Entregue</option>
                                    <option value="EXCEPTION">Exceção / Atraso</option>
                                </select>

                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Localização (Ex: Luanda, Centro Logístico)"
                                    className="p-2 rounded-lg border border-slate-300 text-sm md:col-span-1"
                                    required
                                />

                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Descrição (Ex: Encomenda saiu do armazém)"
                                    className="p-2 rounded-lg border border-slate-300 text-sm md:col-span-2"
                                    required
                                />

                                <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors md:col-span-4 flex justify-center">
                                    Adicionar Evento
                                </button>
                            </form>
                        </div>

                        {/* Events List */}
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-6 py-2">
                            {order.events.length === 0 && (
                                <p className="text-slate-400 text-sm italic">Nenhum evento registrado.</p>
                            )}
                            {order.events.map((event) => (
                                <div key={event.id} className="relative">
                                    <span className="absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 border-white ring-2 ring-purple-100 bg-purple-600"></span>
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">{event.status.replace(/_/g, " ")}</p>
                                        <p className="text-slate-600 text-sm mt-0.5">{event.description}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location || "N/A"}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {helpers.formatDate(event.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Right) */}
                <div className="space-y-6">
                    {/* Customer Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Cliente
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    {order.user.name?.[0] || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 leading-tight">{order.user.name}</p>
                                    <p className="text-xs text-slate-500">{order.user.email}</p>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-slate-50 text-sm space-y-2">
                                <p className="text-slate-600"><span className="font-bold text-slate-900">Tel:</span> {order.user.phone || "Não informado"}</p>
                                <p className="text-slate-600"><span className="font-bold text-slate-900">NIF:</span> {order.user.nif || "Não informado"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Truck className="w-4 h-4" /> Entrega
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Método</p>
                                <p className="font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">{order.deliveryMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Endereço</p>
                                <p className="text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-3">
                                    {order.address ? (() => {
                                        try {
                                            const addr = JSON.parse(order.address)
                                            return `${addr.street || ''}, ${addr.city || ''} - ${addr.province || ''}`
                                        } catch { return order.address }
                                    })() : "Endereço não disponível"}
                                </p>
                            </div>
                            {order.estimatedDeliveryDate && (
                                <div>
                                    <p className="text-xs font-bold text-slate-500 mb-1">Previsão</p>
                                    <p className="text-green-700 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> {helpers.formatDate(order.estimatedDeliveryDate)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Pagamento
                        </h2>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Método</p>
                                <p className="font-medium text-slate-900">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 mb-1">Comprovativo</p>
                                {order.proofUrl ? (
                                    <Link href={order.proofUrl} target="_blank" className="text-blue-600 hover:underline font-medium text-xs break-all">
                                        Ver Comprovativo
                                    </Link>
                                ) : (
                                    <span className="text-slate-400 italic text-xs">Não enviado</span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
