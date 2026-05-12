"use client"

import { useCart } from "@/contexts/CartContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Truck, Store, MapPin, CreditCard, ChevronRight, AlertCircle, Wallet } from "lucide-react"
import { globalLocations, getProvinces, getMunicipalities, getBairros } from "@/data/globalLocations"
import dynamic from "next/dynamic"
import StripeCheckoutButton from "@/components/checkout/StripeCheckout"

// Dynamic import for Map to avoid SSR issues
const CheckoutMap = dynamic(() => import("@/components/checkout/CheckoutMap"), {
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Carregando Mapa...</div>,
    ssr: false
})

function CheckoutContent() {
    const { items, total, checkout } = useCart()
    const { formatPrice } = useCurrency()
    const { t } = useLanguage()
    const session = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    const [deliveryMethod, setDeliveryMethod] = useState(searchParams.get('method') || "DELIVERY")
    const [paymentMethod, setPaymentMethod] = useState<'MANUAL' | 'STRIPE'>('MANUAL')
    const [loading, setLoading] = useState(false)

    // Address State
    const [address, setAddress] = useState({
        country: "Angola",
        province: "",
        municipality: "",
        bairro: "",
        street: "",
        reference: "",
        phone: "",
        email: session.data?.user?.email || ""
    })

    // Map State
    const [position, setPosition] = useState<[number, number] | null>(null)

    // Dependent Lists & Location Logic
    const currentCountryData = useMemo(() => globalLocations.find(c => c.name === address.country), [address.country])
    const provinces = useMemo(() => getProvinces(address.country), [address.country])
    const municipalities = useMemo(() => getMunicipalities(address.country, address.province), [address.country, address.province])
    const bairros = useMemo(() => getBairros(address.country, address.province, address.municipality), [address.country, address.province, address.municipality])

    const hasStructuredRegions = provinces.length > 0
    const hasStructuredMunicipalities = municipalities.length > 0
    const hasStructuredBairros = bairros.length > 0

    const isNegotiable = deliveryMethod === 'DELIVERY'

    // Coupon State
    const [couponCode, setCouponCode] = useState("")
    const [discount, setDiscount] = useState(0)
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, type: string } | null>(null)
    const [validatingCoupon, setValidatingCoupon] = useState(false)
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const baseTotal = total + (isNegotiable ? 0 : 0)
    const finalTotal = baseTotal
    const effectiveTotal = Math.max(0, baseTotal - discount)

    const handleApplyCoupon = async () => {
        if (!couponCode) return
        setValidatingCoupon(true)
        setCouponMessage(null)
        try {
            const res = await fetch("/api/checkout/validate-coupon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: couponCode, cartTotal: total }) // Validate against cart subtotal
            })
            const data = await res.json()
            if (res.ok) {
                setDiscount(data.discountAmount)
                setAppliedCoupon({ code: data.couponCode, type: data.discountType })
                setCouponMessage({ type: 'success', text: `${t('checkout_coupon_success')} Kz ${formatPrice(data.discountAmount)}` })
            } else {
                setDiscount(0)
                setAppliedCoupon(null)
                setCouponMessage({ type: 'error', text: data.error || t('checkout_coupon_invalid') })
            }
        } catch (error) {
            setCouponMessage({ type: 'error', text: "Erro ao validar cupom" })
        } finally {
            setValidatingCoupon(false)
        }
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/checkout')
        }
        // Auto-fill email if available
        if (session.data?.user?.email && !address.email) {
            setAddress(prev => ({ ...prev, email: session.data.user.email! }))
        }
    }, [session.status, router, session.data])

    const mapCenter: [number, number] = currentCountryData
        ? [currentCountryData.lat, currentCountryData.lng]
        : [-11.2027, 17.8739] // Fallback

    const handleCheckout = async () => {
        if (deliveryMethod === 'DELIVERY') {
            if (!address.street || !address.phone || !address.bairro || !address.country) {
                alert(t('auth_error_required'))
                return
            }
        }

        setLoading(true)
        const result = await checkout({
            deliveryMethod,
            address: deliveryMethod === 'DELIVERY' ? {
                ...address,
                latitude: position ? position[0] : null,
                longitude: position ? position[1] : null
            } : undefined,
            paymentMethod: paymentMethod,
            deliveryFee: 0, // Negotiable
            couponCode: appliedCoupon?.code,
            discount: discount
        })

        if (result && result.success && result.orderId) {
            router.push(`/pedido/${result.orderId}/pagamento`)
        } else {
            setLoading(false)
            alert(t('cart_error_checkout'))
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">{t('cart_empty')}</p>
                    <Link href="/" className="text-blue-600 font-bold hover:underline">
                        {t('common_back')}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" /> {t('common_back')}
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900">{t('checkout_title')}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Method Selection */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                                {t('checkout_method_title')}
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setDeliveryMethod('DELIVERY')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'DELIVERY'
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${deliveryMethod === 'DELIVERY' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <span className={`font-bold ${deliveryMethod === 'DELIVERY' ? 'text-blue-900' : 'text-gray-500'}`}>{t('cart_delivery')}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-[52px]">Entrega ao Domicílio</p>
                                </button>
                                <button
                                    onClick={() => setDeliveryMethod('PICKUP')}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${deliveryMethod === 'PICKUP'
                                        ? 'border-brand-gold bg-yellow-50/50'
                                        : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${deliveryMethod === 'PICKUP' ? 'bg-brand-gold text-brand-dark' : 'bg-gray-100 text-gray-400'}`}>
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <span className={`font-bold ${deliveryMethod === 'PICKUP' ? 'text-brand-dark' : 'text-gray-500'}`}>{t('cart_pickup')}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 pl-[52px]">Levantamento em Loja</p>
                                </button>
                            </div>
                        </div>

                        {/* 2. Address / Details */}
                        {deliveryMethod === 'DELIVERY' && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                                        {t('checkout_step_address')}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Country */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_country')}</label>
                                            <select
                                                className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                value={address.country}
                                                onChange={(e) => setAddress({ ...address, country: e.target.value, province: '', municipality: '', bairro: '' })}
                                            >
                                                {globalLocations.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        {/* Province - Conditional */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_province')}</label>
                                            {hasStructuredRegions ? (
                                                <select
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={address.province}
                                                    onChange={(e) => setAddress({ ...address, province: e.target.value, municipality: '', bairro: '' })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Digite o estado/província"
                                                    value={address.province}
                                                    onChange={(e) => setAddress({ ...address, province: e.target.value })}
                                                />
                                            )}
                                        </div>

                                        {/* Municipality - Conditional */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_city')}</label>
                                            {hasStructuredMunicipalities ? (
                                                <select
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={address.municipality}
                                                    onChange={(e) => setAddress({ ...address, municipality: e.target.value, bairro: '' })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Digite a cidade"
                                                    value={address.municipality}
                                                    onChange={(e) => setAddress({ ...address, municipality: e.target.value })}
                                                />
                                            )}
                                        </div>

                                        {/* Bairro - Conditional */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_neighborhood')}</label>
                                            {hasStructuredBairros ? (
                                                <select
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={address.bairro}
                                                    onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                                                >
                                                    <option value="">Selecione...</option>
                                                    {bairros.map(b => <option key={b} value={b}>{b}</option>)}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="Ex: Talatona"
                                                    value={address.bairro}
                                                    onChange={(e) => setAddress({ ...address, bairro: e.target.value })}
                                                />
                                            )}
                                        </div>

                                        {/* Contact & Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_phone')}</label>
                                            <div className="flex gap-2">
                                                <div className="relative w-[140px]">
                                                    <select
                                                        className="w-full p-3 pl-10 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                                                        value={globalLocations.find(c => c.phoneCode === address.phone.split(' ')[0])?.name || address.country}
                                                        onChange={(e) => {
                                                            const country = globalLocations.find(c => c.name === e.target.value)
                                                            if (country?.phoneCode) {
                                                                // Keep the number part if exists, just replace/prepend code
                                                                const numberPart = address.phone.includes(' ') ? address.phone.split(' ')[1] : address.phone.replace(/^\+\d+/, '')
                                                                setAddress({ ...address, phone: `${country.phoneCode} ${numberPart.trim()}` })
                                                            }
                                                        }}
                                                    >
                                                        {globalLocations.filter(c => c.phoneCode).map(c => (
                                                            <option key={c.code} value={c.name}>
                                                                {c.code} ({c.phoneCode})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        {(() => {
                                                            const phonePrefix = address.phone.split(' ')[0]
                                                            const countryByPhone = globalLocations.find(c => c.phoneCode === phonePrefix)
                                                            const currentCode = countryByPhone?.code || globalLocations.find(c => c.name === address.country)?.code || 'AO'
                                                            return <img src={`https://flagcdn.com/w20/${currentCode?.toLowerCase()}.png`} width={20} alt="flag" />
                                                        })()}
                                                    </div>
                                                </div>
                                                <input
                                                    type="tel"
                                                    className="flex-1 p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="9xx xxx xxx"
                                                    value={address.phone.includes(' ') ? address.phone.split(' ').slice(1).join(' ') : address.phone.replace(/^\+\d+/, '')}
                                                    onChange={(e) => {
                                                        const prefix = address.phone.split(' ')[0] || globalLocations.find(c => c.name === address.country)?.phoneCode || '+244'
                                                        setAddress({ ...address, phone: `${prefix} ${e.target.value}` })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="seu@email.com"
                                                value={address.email}
                                                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('checkout_addr_street')}</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder={t('checkout_addr_street_ph')}
                                                value={address.street}
                                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ponto de Referência</label>
                                            <input
                                                type="text"
                                                className="w-full p-3 bg-gray-50 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="Próximo a..."
                                                value={address.reference}
                                                onChange={(e) => setAddress({ ...address, reference: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Map Visualization */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">📍</span>
                                        {t('checkout_map_hint')} ({address.country})
                                    </h2>
                                    <div className="h-[300px] w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                                        <CheckoutMap position={position} setPosition={setPosition} center={mapCenter} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">{t('checkout_map_desc')}</p>
                                </div>
                            </div>
                        )}

                        {/* 3. Payment */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
                                {t('checkout_step_payment')}
                            </h2>

                            {/* Payment Method Selection */}
                            <div className="space-y-3 mb-6">
                                {/* Manual Payment Option */}
                                <button
                                    onClick={() => setPaymentMethod('MANUAL')}
                                    className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'MANUAL'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full shadow-sm ${paymentMethod === 'MANUAL' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900">{t('payment_method_manual')}</p>
                                        <p className="text-sm text-gray-600">{t('payment_manual_desc')}</p>
                                    </div>
                                    {paymentMethod === 'MANUAL' && (
                                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </button>

                                {/* Stripe Payment Option */}
                                <button
                                    onClick={() => setPaymentMethod('STRIPE')}
                                    className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${paymentMethod === 'STRIPE'
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full shadow-sm ${paymentMethod === 'STRIPE' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-gray-900">{t('payment_method_card')}</p>
                                        <p className="text-sm text-gray-600">Secure Stripe Payment</p>
                                    </div>
                                    {paymentMethod === 'STRIPE' && (
                                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-white"></div>
                                        </div>
                                    )}
                                </button>
                            </div>

                            {/* Payment Method Details */}
                            {paymentMethod === 'MANUAL' && (
                                <div className="p-4 border border-blue-100 bg-blue-50 rounded-xl">
                                    <p className="text-sm text-blue-800">
                                        Após confirmar o pedido, você receberá instruções de pagamento por email.
                                    </p>
                                </div>
                            )}
                            {paymentMethod === 'STRIPE' && (
                                <div className="p-4 border border-purple-100 bg-purple-50 rounded-xl">
                                    <p className="text-sm text-purple-800 mb-2">
                                        <strong>Pagamento seguro:</strong> Processado pela Stripe com criptografia SSL.
                                    </p>
                                    <p className="text-xs text-purple-600">
                                        Aceita Visa, Mastercard, American Express e mais.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Right Column: Summary */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">{t('summary_title')}</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>{t('cart_subtotal')}</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-sm">
                                    <span>{t('cart_delivery_fee')}</span>
                                    {isNegotiable ? (
                                        <span className="text-brand-gold font-bold text-xs uppercase bg-yellow-50 px-2 py-1 rounded">{t('checkout_negotiable')}</span>
                                    ) : (
                                        <span className="text-green-600 font-medium">{t('cart_free')}</span>
                                    )}
                                </div>
                                {isNegotiable && (
                                    <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded border border-gray-100 flex gap-2 items-start">
                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>A taxa de entrega será combinada diretamente com o vendedor após a confirmação.</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                                    <span className="font-bold text-gray-900">{t('cart_total')}</span>
                                    <div className="text-right">
                                        {discount > 0 && <span className="text-sm text-gray-500 line-through mr-2">{formatPrice(finalTotal)}</span>}
                                        <span className="text-2xl font-black text-brand-dark block leading-none">{formatPrice(effectiveTotal)}</span>
                                        <span className="text-xs text-brand-gold uppercase font-bold tracking-wider opacity-80">AOA</span>
                                    </div>
                                </div>

                                {/* Coupon Input */}
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">{t('checkout_coupon_title')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder={t('checkout_coupon_placeholder')}
                                            className="flex-1 border p-2 rounded text-sm uppercase"
                                            disabled={!!appliedCoupon}
                                        />
                                        {appliedCoupon ? (
                                            <button
                                                onClick={() => {
                                                    setAppliedCoupon(null)
                                                    setDiscount(0)
                                                    setCouponCode("")
                                                }}
                                                className="bg-red-100 text-red-600 px-3 py-2 rounded text-sm font-bold hover:bg-red-200"
                                            >
                                                Remover
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode || validatingCoupon}
                                                className="bg-gray-900 text-white px-3 py-2 rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                                            >
                                                {validatingCoupon ? "..." : t('checkout_coupon_apply')}
                                            </button>
                                        )}
                                    </div>
                                    {couponMessage && (
                                        <p className={`text-xs mt-1 ${couponMessage.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                                            {couponMessage.text}
                                        </p>
                                    )}
                                </div>

                                {/* Unified Checkout Button */}
                                <button
                                    onClick={handleCheckout}
                                    disabled={loading || items.length === 0}
                                    className={`w-full py-4 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg
                                        ${paymentMethod === 'STRIPE'
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t('payment_btn_process')}
                                        </>
                                    ) : (
                                        <>
                                            {paymentMethod === 'STRIPE' ? 'Ir para Pagamento (Stripe)' : t('payment_btn_confirm')}
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Checkout...</div>}>
            <CheckoutContent />
        </Suspense>
    )
}
