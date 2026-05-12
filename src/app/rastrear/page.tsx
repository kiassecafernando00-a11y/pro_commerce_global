"use client"

import { useState } from "react"
import { Search, Truck, MapPin, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface TrackingData {
    trackingCode: string
    status: string
    estimatedDelivery: string | null
    events: {
        id: string
        status: string
        description: string
        location: string | null
        createdAt: string
    }[]
    route: {
        countryName: string
        carrier: string
        baseDays: number
        maxDays: number
    }
    destination: {
        city: string | null
        country: string | null
    }
    items: {
        name: string
        image: string
    }[]
}

export default function TrackingPage() {
    const [orderId, setOrderId] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [data, setData] = useState<TrackingData | null>(null)
    const { t } = useLanguage()

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!orderId.trim()) return

        setLoading(true)
        setError("")
        setData(null)

        try {
            const res = await fetch(`/api/tracking?code=${encodeURIComponent(orderId)}`)
            const json = await res.json()

            if (!res.ok) {
                throw new Error(json.error || t('track_not_found'))
            }

            setData(json)
        } catch (err: any) {
            setError(err.message || t('track_error'))
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case 'DELIVERED': return 'bg-green-500'
            case 'SHIPPED':
            case 'IN_TRANSIT': return 'bg-blue-500'
            case 'EXCEPTION': return 'bg-red-500'
            default: return 'bg-yellow-500'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6">
            <div className="max-w-3xl w-full space-y-8">
                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                        <Truck className="w-8 h-8" />
                    </div>

                    <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">{t('track_title')}</h1>
                    <p className="text-gray-500 text-center mb-8 text-sm">
                        {t('track_desc')}
                    </p>

                    <form onSubmit={handleSearch} className="space-y-4 max-w-md mx-auto">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t('track_label')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Ex: TRACK-12345"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono uppercase"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !orderId}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? t('track_searching') : t('track_btn')}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Results Section */}
                {data && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                        {/* Header Info */}
                        <div className="bg-blue-900 text-white p-6 md:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">{t('track_current_status')}</p>
                                    <h2 className="text-3xl font-bold">{data.status}</h2>
                                    {data.route.carrier && (
                                        <p className="text-blue-200 text-sm mt-2 flex items-center gap-2">
                                            <Truck className="w-4 h-4" /> {t('track_via')} {data.route.carrier}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-200 text-sm font-bold uppercase tracking-wider mb-1">{t('track_destination')}</p>
                                    <h3 className="text-xl font-bold flex items-center gap-2 justify-end">
                                        <MapPin className="w-5 h-5" /> {data.destination.country || "Internacional"}
                                    </h3>
                                    <p className="text-blue-200 text-xs mt-1">
                                        {t('track_forecast')}: {data.route.baseDays}-{data.route.maxDays} {t('track_days')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-6 md:p-8">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                {t('track_history')}
                            </h3>

                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                                {data.events.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">{t('track_waiting')}</p>
                                ) : (
                                    data.events.map((event, i) => (
                                        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>

                                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                                                <div className="flex items-center justify-between space-x-2 mb-1">
                                                    <div className="font-bold text-slate-900">{event.status}</div>
                                                    <time className="font-mono text-xs font-medium text-slate-500">
                                                        {new Date(event.createdAt).toLocaleDateString()}
                                                    </time>
                                                </div>
                                                <div className="text-slate-500 text-sm">
                                                    {event.description}
                                                    {event.location && (
                                                        <span className="block text-xs font-semibold text-slate-400 mt-1">
                                                            📍 {event.location}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
