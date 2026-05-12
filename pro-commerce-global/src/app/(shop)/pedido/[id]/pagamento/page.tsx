"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { CheckCircle, Copy, Upload, Store, User, MapPin, Truck, AlertCircle } from "lucide-react"

export default function OrderPaymentPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (params.id) fetchOrder()
    }, [params.id])

    async function fetchOrder() {
        try {
            const res = await fetch(`/api/order-payment/${params.id}`)
            if (res.ok) {
                const data = await res.json()
                setOrder(data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        // Removed blocking confirm, just upload
        setUploading(true)
        console.log("Starting upload for file:", file.name)

        const formData = new FormData()
        formData.append("file", file)

        try {
            // Upload File
            const upRes = await fetch("/api/upload", { method: "POST", body: formData })
            if (!upRes.ok) {
                const err = await upRes.text()
                throw new Error(`Upload failed: ${err}`)
            }
            const { url } = await upRes.json()
            console.log("File uploaded, url:", url)

            // Update Order
            const updateRes = await fetch(`/api/orders/${order.id}/proof`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofUrl: url })
            })

            if (updateRes.ok) {
                // Optimistic update
                setOrder((prev: any) => ({ ...prev, proofUrl: url }))
                alert("Comprovativo enviado com sucesso!")
                fetchOrder()
            } else {
                const errText = await updateRes.text()
                console.error("Update failed:", updateRes.status, errText)
                throw new Error(`Falha no servidor (${updateRes.status}): ${errText}`)
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert(`Erro ao enviar comprovativo: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
        } finally {
            setUploading(false)
            // Reset input value to allow re-uploading same file if needed (though component re-renders)
            e.target.value = ""
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
    if (!order) return <div className="min-h-screen flex items-center justify-center">Pedido não encontrado</div>

    // Group items by Store to show bank accounts properly? 
    // For MVP, we assume mostly 1 store. If multiple, we show all stores involved.
    const storesMap = new Map()
    order.items.forEach((item: any) => {
        const store = item.product?.store
        if (store && store.id && !storesMap.has(store.id)) {
            storesMap.set(store.id, store)
        }
    })
    const stores = Array.from(storesMap.values())

    const addressData = (() => {
        try {
            return JSON.parse(order.address || "{}")
        } catch (e) {
            return { city: "N/A", province: "N/A", street: "Endereço não disponível", phone: "" }
        }
    })()

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Success Header */}
                <div className="bg-green-600 text-white p-8 rounded-3xl shadow-xl text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-black mb-2">Pedido Recebido!</h1>
                        <p className="text-green-100 text-lg">Obrigado pela sua compra. Siga as instruções abaixo para finalizar.</p>
                        <div className="mt-6 inline-block bg-green-700/50 rounded-lg px-4 py-2 border border-green-500/30">
                            <span className="text-sm font-medium">Pedido #{order.id.slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Left: Payment Info */}
                    <div className="space-y-6">
                        {/* Vendor Bank Info */}
                        {stores.map((store: any) => (
                            <div key={store.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                                    {store.logo && <img src={store.logo} className="w-12 h-12 rounded-full object-cover border border-gray-100" />}
                                    <div>
                                        <h3 className="font-bold text-gray-900">{store.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            Responsável: {store.user.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Coordenadas Bancárias</h4>

                                    {store.bankAccounts && store.bankAccounts.length > 0 ? (
                                        store.bankAccounts.map((acc: any) => (
                                            <div key={acc.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-gray-900">{acc.bankName}</span>
                                                    <button onClick={() => navigator.clipboard.writeText(acc.iban)} className="text-blue-600 hover:text-blue-700">
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-600 break-all font-mono bg-white p-2 rounded border border-gray-200">
                                                    {acc.iban}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-2">Titular: {acc.holderName}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
                                            Este vendedor não cadastrou contas bancárias. Entre em contato direto.
                                            <br />
                                            {store.phone && <span className="font-bold block mt-1">Tel: {store.phone}</span>}
                                        </div>
                                    )}



                                    {/* Proof Upload */}
                                    <div className="pt-4 border-t border-gray-100 mt-4">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-brand-gold" />
                                            Enviar Comprovativo
                                        </h4>
                                        {order.proofUrl || order.status === 'PAID' ? (
                                            <div className="space-y-3">
                                                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3 border border-green-100">
                                                    <div className="bg-green-100 p-2 rounded-full">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-green-800">Comprovativo Enviado!</p>
                                                        <p className="text-xs text-green-600 mt-0.5">O vendedor foi notificado e irá validar seu pagamento.</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => router.push('/minha-conta/pedidos')}
                                                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200"
                                                >
                                                    Finalizar
                                                </button>
                                            </div>
                                        ) : (
                                            <label className={`block w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand-gold hover:bg-brand-gold/5 transition-all group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-white text-gray-400 group-hover:text-brand-gold transition-colors">
                                                    <Upload className="w-5 h-5" />
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                                                    {uploading ? 'Enviando...' : 'Clique para Anexar (PDF/Foto)'}
                                                </span>
                                                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
                                            </label>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                                            O envio do comprovativo é obrigatório para liberação do pedido.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: Summary & Delivery */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Detalhes da Entrega</h3>

                            {/* Address */}
                            <div className="flex items-start gap-3 mb-6 bg-gray-50 p-4 rounded-xl">
                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="font-bold text-gray-800">Endereço de Entrega</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {addressData.street}
                                        <br />
                                        {addressData.city}, {addressData.province}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1 font-medium">
                                        Tel: {addressData.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Delivery Fee Info */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-3">
                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-blue-600 mt-1" />
                                    <div>
                                        <p className="font-bold text-blue-800">Taxa de Entrega</p>
                                        <p className="text-sm text-blue-700 mt-1">
                                            O valor da entrega é <strong>negociável</strong> e calculado com base na sua localização ({addressData.city}).
                                        </p>
                                    </div>
                                </div>

                                {stores.map((store: any) => store.phone && (
                                    <a
                                        key={store.id}
                                        href={`https://wa.me/${store.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá ${store.name}, fiz o pedido #${order.id} e gostaria de combinar a entrega em ${addressData.city}.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-green-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-600 transition-colors shadow-sm"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        Negociar Entrega no WhatsApp
                                    </a>
                                ))}

                                <span className="text-xs text-blue-600/80 mt-1 block px-1">O vendedor entrará em contato para confirmar o valor final se não iniciar a conversa.</span>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <div className="space-y-3 pb-4 border-b border-gray-100">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: order.currency }).format(order.total)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Entrega</span>
                                    <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">A Combinar</span>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-lg font-black text-gray-900">Total</span>
                                <span className="text-2xl font-black text-brand-dark">
                                    {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: order.currency }).format(order.total)}
                                </span>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-4">
                                * Sem incluir taxa de entrega
                            </p>
                        </div>

                        <button onClick={() => router.push('/minha-conta/pedidos')} className="w-full py-3 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                            Ir para Meus Pedidos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
