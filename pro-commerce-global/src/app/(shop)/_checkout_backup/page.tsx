"use client"

import { useCart } from "@/contexts/CartContext"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreditCard, Banknote, QrCode, AlertCircle, MapPin, Info } from "lucide-react"
import { StripeWrapper } from "@/components/checkout/StripeWrapper"
import { StripePaymentForm } from "@/components/checkout/StripePaymentForm"
import dynamic from "next/dynamic"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCurrency } from "@/contexts/CurrencyContext"

// Dynamic Import for Map (Leaflet requires window)
const LocationMap = dynamic(() => import("@/components/checkout/LocationMap"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400">Carregando Mapa...</div>
})

type PaymentMethod = 'MANUAL' | 'VISA' | 'MASTERCARD' | 'BINANCE'
type DeliveryMethod = 'DELIVERY' | 'PICKUP'

import { getActivePaymentMethods, getExchangeRates } from "@/app/actions/public"

export default function CheckoutPage() {
    const { items, total, clearCart } = useCart()
    const router = useRouter()
    const { data: session } = useSession()
    const { t } = useLanguage()
    // Integrate Global Currency
    const { currency, setCurrency, formatPrice } = useCurrency()

    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1) // 1 = Address, 2 = Payment
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('DELIVERY')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MANUAL')
    // Removed local currency state in favor of global context

    const [activeGateways, setActiveGateways] = useState<string[]>([])

    // Fetch active gateways on mount
    useEffect(() => {
        getActivePaymentMethods().then(methods => setActiveGateways(methods))
    }, [])

    // Detailed Address State
    const [address, setAddress] = useState({
        country: "Angola",
        province: "Luanda",
        city: "", // Municipio/Cidade
        neighborhood: "", // Bairro
        street: "", // Rua
        number: "", // Numero da casa (opcional)
        phone: "",
        reference: "" // Ponto de referencia
    })

    // Geolocation State
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [calculatingFee, setCalculatingFee] = useState(false)

    // Calculate Delivery Fee when location changes or delivery method changes
    useEffect(() => {
        if (deliveryMethod === 'PICKUP') {
            setDeliveryFee(0)
            return
        }

        if (location && items.length > 0) {
            setCalculatingFee(true)
            fetch("/api/delivery/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userLocation: location,
                    items: items.map(item => ({
                        storeId: item.storeId, // Ensure storeId is passed
                        quantity: item.quantity
                    }))
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.totalFee !== undefined) {
                        setDeliveryFee(data.totalFee)
                    }
                })
                .catch(err => console.error("Fee calc error:", err))
                .finally(() => setCalculatingFee(false))
        }
    }, [location, items, deliveryMethod])

    if (items.length === 0) {
        if (typeof window !== 'undefined') {
            router.push("/carrinho")
        }
        return null
    }

    // Exchange Rates for logic (fetching separately to ensure we have numeric values for API)
    // Ideally CurrencyContext would expose 'exchangeRate' but we keep this for safety
    const [rates, setRates] = useState<Record<string, number>>({ AOA: 1, USD: 0.0011, EUR: 0.0010 })

    useEffect(() => {
        getExchangeRates().then(serverRates => {
            if (Object.keys(serverRates).length > 0) {
                setRates(serverRates)
            }
        })
    }, [])

    const displayTotal = (total + deliveryFee) * (rates[currency] || 0)

    const handleSubmit = async (e: React.FormEvent, paymentReference?: string) => {
        e.preventDefault()
        setLoading(true)

        if (!session) {
            router.push(`/auth/login?callbackUrl=/checkout`)
            return
        }

        // Format User-Friendly Address String for display/storage in simple field
        const formattedAddress = `${address.street}, ${address.number ? `nº ${address.number}, ` : ''}${address.neighborhood}, ${address.city}, ${address.province}`.trim()

        // Full Object for structured storage if needed, but schema uses JSON string usually
        const fullAddressData = {
            ...address,
            formatted: formattedAddress
        }

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price // Store base price in AOA
                    })),
                    total: total, // Store base total in AOA
                    address: JSON.stringify(fullAddressData), // Store full JSON
                    latitude: location?.lat,
                    longitude: location?.lng,
                    deliveryFee: deliveryFee, // Send calculated fee
                    deliveryMethod, // Send selected method
                    paymentMethod,
                    currency, // Store selected currency preference
                    finalAmount: displayTotal, // Just for record if needed, primarily we store total
                    reference: paymentReference // Pass the reference
                }),
            })

            if (response.ok) {
                const data = await response.json()
                console.log("Order created:", data)
                clearCart()
                // Force navigation to ensure new page loads
                window.location.href = `/pedido/${data.orderId}/pagamento`
            } else {
                const errData = await response.json()
                console.error("Order API Error:", errData)
                alert(`${t('payment_error')}: ${errData.error || JSON.stringify(errData)}`)
            }
        } catch (error) {
            console.error("Checkout Request Failed:", error)
            alert(`${t('common_error')}: ${error instanceof Error ? error.message : "Desconhecido"}`)
        } finally {
            setLoading(false)
        }
    }

    // Helper to validate step 1
    const canProceedToPayment = () => {
        const isProfileComplete = address.province && address.city && address.neighborhood && address.street && address.phone
        if (deliveryMethod === 'PICKUP') return !!address.phone // For pickup, just phone is critical, but we keep others for billing if needed
        return isProfileComplete && location // For delivery, need location
    }

    return (
        <div className="min-h-screen bg-gray-50">


            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout_title')}</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Form Area */}
                    <div className="flex-1 space-y-6">

                        {/* 1. Address Section */}
                        <div className={`bg-white rounded-xl shadow-sm p-6 border ${step === 1 ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                                    {t('checkout_step_address')}
                                </h2>
                                {step > 1 && <button onClick={() => setStep(1)} className="text-blue-600 text-sm font-bold hover:underline">{t('common_edit')}</button>}
                            </div>

                            {step === 1 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">

                                    {/* Delivery Method Selection */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-bold text-gray-700">{t('checkout_method_title')}</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={() => setDeliveryMethod('DELIVERY')}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'DELIVERY' ? 'border-brand-gold bg-yellow-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                                                    <span className="text-xl">🚚</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{t('checkout_method_delivery')}</span>
                                                <span className="text-xs text-gray-500">{t('checkout_method_fee_calc')}</span>
                                            </button>

                                            <button
                                                onClick={() => setDeliveryMethod('PICKUP')}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${deliveryMethod === 'PICKUP' ? 'border-brand-gold bg-yellow-50/50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="bg-white p-2 rounded-full shadow-sm mb-2">
                                                    <span className="text-xl">🏪</span>
                                                </div>
                                                <span className="font-bold text-gray-900">{t('checkout_method_pickup')}</span>
                                                <span className="text-xs text-green-600 font-bold">{t('checkout_method_free')}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {deliveryMethod === 'DELIVERY' && (
                                        <div className="space-y-2 pt-4 border-t border-gray-100 bg-red-50 p-4 border-2 border-red-500 rounded-lg">
                                            <h3 className="text-red-600 font-bold text-lg">{t('checkout_map_hint')}</h3>
                                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-brand-gold" />
                                                {t('checkout_map_hint')}
                                            </label>
                                            <div className="text-xs text-gray-500 mb-2">{t('checkout_map_desc')}</div>
                                            <LocationMap onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                                            {location && <div className="text-xs text-green-600 font-bold">{t('common_success')}: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</div>}
                                        </div>
                                    )}

                                    {/* Address Fields - Hide for Pickup, except Phone */}
                                    {deliveryMethod === 'DELIVERY' ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_country')}</label>
                                                    <input
                                                        disabled
                                                        value={address.country}
                                                        className="w-full px-4 py-3 border border-gray-100 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_province')} *</label>
                                                    <select
                                                        value={address.province}
                                                        onChange={e => setAddress({ ...address, province: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none bg-white"
                                                    >
                                                        <option value="Luanda">Luanda</option>
                                                        <option value="Bengo">Bengo</option>
                                                        <option value="Benguela">Benguela</option>
                                                        <option value="Cabinda">Cabinda</option>
                                                        <option value="Huambo">Huambo</option>
                                                        <option value="Huíla">Huíla</option>
                                                        {/* Add more as needed */}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_city')} *</label>
                                                    <input
                                                        required
                                                        value={address.city}
                                                        onChange={e => setAddress({ ...address, city: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                        placeholder={t('checkout_addr_city')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_neighborhood')} *</label>
                                                    <input
                                                        required
                                                        value={address.neighborhood}
                                                        onChange={e => setAddress({ ...address, neighborhood: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                        placeholder={t('checkout_addr_neighborhood')}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_street')} *</label>
                                                <input
                                                    required
                                                    value={address.street}
                                                    onChange={e => setAddress({ ...address, street: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                    placeholder={t('checkout_addr_street_ph')}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_number')}</label>
                                                    <input
                                                        value={address.number}
                                                        onChange={e => setAddress({ ...address, number: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                        placeholder={t('checkout_addr_number_ph')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_phone')} *</label>
                                                    <input
                                                        required
                                                        type="tel"
                                                        value={address.phone}
                                                        onChange={e => setAddress({ ...address, phone: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                        placeholder="9XX XXX XXX"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <div className="flex gap-3 mb-4">
                                                <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                <div className="text-sm text-blue-800">
                                                    <p className="font-bold mb-1">{t('checkout_pickup_hint_title')}</p>
                                                    <p>{t('checkout_pickup_hint_desc')}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">{t('checkout_addr_phone')} *</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    value={address.phone}
                                                    onChange={e => setAddress({ ...address, phone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold outline-none"
                                                    placeholder="9XX XXX XXX"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (canProceedToPayment()) setStep(2)
                                            else alert(deliveryMethod === 'DELIVERY' ? t('checkout_map_hint') : t('checkout_addr_phone'))
                                        }}
                                        className="w-full bg-black text-white font-bold py-3.5 rounded-lg hover:bg-gray-800 transition-colors mt-2"
                                    >
                                        {t('checkout_btn_confirm')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 2. Payment Section */}
                        <div className={`bg-white rounded-xl shadow-sm p-6 border ${step === 2 ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-gray-200'} ${step < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                                {t('checkout_step_payment')}
                            </h2>

                            {step === 2 && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                    {/* Currency Selector */}
                                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <span className="text-sm font-bold text-gray-600">{t('payment_currency')}:</span>
                                        <div className="flex gap-2">
                                            {(['AOA', 'USD', 'EUR'] as const).map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => {
                                                        setCurrency(c)
                                                        if (c === "AOA" && paymentMethod !== "MANUAL") setPaymentMethod("MANUAL")
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${currency === c ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Method Selector */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setPaymentMethod('MANUAL')}
                                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${paymentMethod === 'MANUAL' ? 'border-brand-gold bg-yellow-50 text-brand-dark' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <Banknote className="w-6 h-6" />
                                            <span className="text-xs font-bold text-center">{t('payment_method_manual')}</span>
                                        </button>

                                        {/* Dynamic Stripe Toggle */}
                                        {activeGateways.includes('STRIPE') && (
                                            <button
                                                disabled={currency === "AOA"}
                                                onClick={() => setPaymentMethod('VISA')}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${['VISA', 'MASTERCARD'].includes(paymentMethod) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 hover:border-gray-300'} ${currency === "AOA" ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <CreditCard className="w-6 h-6" />
                                                <span className="text-xs font-bold text-center">{t('payment_method_card')} {currency === "AOA" && "(USD/EUR)"}</span>
                                            </button>
                                        )}

                                        {/* Dynamic Binance Toggle */}
                                        {activeGateways.includes('BINANCE') && (
                                            <button
                                                onClick={() => setPaymentMethod('BINANCE')}
                                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2 ${paymentMethod === 'BINANCE' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 hover:border-gray-300'}`}
                                            >
                                                <QrCode className="w-6 h-6" />
                                                <span className="text-xs font-bold text-center">{t('payment_method_crypto')}</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Detailed Forms */}
                                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                        {paymentMethod === 'MANUAL' && (
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-bold text-gray-800">{t('payment_method_manual')}</p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {t('payment_manual_desc')}
                                                    </p>

                                                    <button
                                                        onClick={handleSubmit}
                                                        disabled={loading}
                                                        className="w-full bg-brand-gold text-brand-dark font-black py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-brand-gold/20 transform hover:-translate-y-1 mt-4"
                                                    >
                                                        {loading ? t('payment_btn_process') : `${t('payment_btn_confirm')} (${formatPrice(displayTotal)})`}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stripe Form */}
                                        {(paymentMethod === 'VISA' || paymentMethod === 'MASTERCARD') && activeGateways.includes('STRIPE') && (
                                            <StripeWrapper>
                                                <StripePaymentForm
                                                    amount={displayTotal}
                                                    currency={currency}
                                                    onSuccess={(pid) => {
                                                        handleSubmit(new Event('submit') as any, pid);
                                                    }}
                                                    onError={(msg) => alert(`${t('common_error')}: ${msg}`)}
                                                />
                                            </StripeWrapper>
                                        )}

                                        {/* Binance Form */}
                                        {paymentMethod === 'BINANCE' && activeGateways.includes('BINANCE') && (
                                            <div className="text-center space-y-4">
                                                <p className="font-bold text-gray-800">{t('payment_binance_title')}</p>
                                                <button
                                                    onClick={async () => {
                                                        setLoading(true);
                                                        try {
                                                            const res = await fetch("/api/payment/binance", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ amount: displayTotal, currency: currency === "AOA" ? "USDT" : currency }) // Binance often prefers USDT over AOA
                                                            });
                                                            const data = await res.json();
                                                            if (data.checkoutUrl) {
                                                                window.open(data.checkoutUrl, "_blank");
                                                                // We assume success for now or should implement polling
                                                                handleSubmit(new Event('submit') as any, "BINANCE_PENDING");
                                                            } else {
                                                                alert(t('common_error'));
                                                            }
                                                        } catch (e) {
                                                            alert(t('common_error'));
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }}
                                                    disabled={loading}
                                                    className="w-full bg-[#F3BA2F] text-black font-black py-4 rounded-xl hover:bg-[#d9a526] transition-all shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2"
                                                >
                                                    {loading ? t('payment_btn_process') : t('payment_btn_pay_binance')}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{t('summary_title')}</h2>

                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                        <div className="flex gap-3">
                                            <span className="font-bold text-gray-400">{item.quantity}x</span>
                                            <span className="text-gray-700 truncate max-w-[150px]">{item.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-900">
                                            {formatPrice((item.price * item.quantity))}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-2 bg-gray-50/50 p-4 rounded-lg">
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>{t('cart_subtotal')}</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>{t('cart_delivery_fee')}</span>
                                    {calculatingFee ? (
                                        <span className="text-xs text-brand-gold animate-pulse">{t('summary_calculating')}</span>
                                    ) : (
                                        <span>{formatPrice(deliveryFee)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-lg font-bold text-gray-900">{t('cart_total')}</span>
                                    <span className="text-2xl font-bold text-brand-dark">
                                        {formatPrice(total + deliveryFee)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-center text-[10px] text-gray-400 mt-4">
                                {t('summary_legal')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
