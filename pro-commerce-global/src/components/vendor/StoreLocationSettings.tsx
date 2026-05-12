"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { MapPin, Navigation, Coins } from "lucide-react"
import dynamic from "next/dynamic"

const LocationMap = dynamic(() => import("@/components/checkout/LocationMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-slate-400 font-bold">Carregando Mapa...</div>
})

interface StoreLocation {
    latitude: number | null
    longitude: number | null
    deliveryPricePerKm: number
    deliveryBaseFee: number
}

interface StoreLocationSettingsProps {
    initialData: StoreLocation
}

export default function StoreLocationSettings({ initialData }: StoreLocationSettingsProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        deliveryPricePerKm: initialData.deliveryPricePerKm || 0,
        deliveryBaseFee: initialData.deliveryBaseFee || 0,
    })
    const [saving, setSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch("/api/store", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success("Localização e taxas atualizadas!")
                router.refresh()
            } else {
                throw new Error("Failed to save")
            }
        } catch (error) {
            console.error("Error saving store:", error)
            toast.error("Erro ao salvar alterações.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Localização e Entrega</h2>
                <p className="text-slate-500 text-sm">Defina onde sua loja está e quanto cobrar pela entrega.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Map */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
                        <LocationMap
                            onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                            initialLat={formData.latitude || undefined}
                            initialLng={formData.longitude || undefined}
                        />
                    </div>
                    {formData.latitude ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                            <CheckPin className="w-5 h-5" />
                            <p className="text-sm font-bold">
                                Localização definida: {formData.latitude.toFixed(6)}, {formData.longitude?.toFixed(6)}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-3 rounded-xl border border-amber-100">
                            <MapPin className="w-5 h-5" />
                            <p className="text-sm font-bold">Por favor, selecione a localização no mapa.</p>
                        </div>
                    )}
                </div>

                {/* Right: Fees */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-dark">
                                <Coins className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-slate-900">Configuração de Taxas</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Taxa Base (Fixo)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-slate-400 font-bold">Kz</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors font-bold text-lg"
                                        value={formData.deliveryBaseFee}
                                        onChange={e => setFormData({ ...formData, deliveryBaseFee: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Valor inicial cobrado em todas as entregas.</p>
                            </div>

                            <div className="w-full h-px bg-slate-100"></div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Preço por Km
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3 text-slate-400 font-bold">Kz</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors font-bold text-lg"
                                        value={formData.deliveryPricePerKm}
                                        onChange={e => setFormData({ ...formData, deliveryPricePerKm: Number(e.target.value) })}
                                        placeholder="0"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">Adicional cobrado por cada quilómetro de distância.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-brand-gold text-brand-dark font-black rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl active:scale-95 text-lg"
                    >
                        {saving ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>
            </div>
        </form>
    )
}

function CheckPin({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    )
}
