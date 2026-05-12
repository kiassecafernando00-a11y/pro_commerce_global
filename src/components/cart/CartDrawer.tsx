"use client"

import { useCurrency } from "@/contexts/CurrencyContext"
import { useCart } from "@/contexts/CartContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Truck, Store } from "lucide-react"

export function CartDrawer() {
    const { items, isOpen, toggleCart, removeFromCart, updateQuantity, total, checkout } = useCart()
    const { formatPrice } = useCurrency()
    const { t } = useLanguage()
    const [mounted, setMounted] = useState(false)
    const [deliveryMethod, setDeliveryMethod] = useState("DELIVERY") // DELIVERY | PICKUP

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    // Delivery fee is 2000 AOA base
    const deliveryFeeAOA = 2000
    const deliveryFee = deliveryMethod === 'DELIVERY' ? deliveryFeeAOA : 0
    const finalTotal = total + deliveryFee

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={toggleCart}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div className="flex flex-col h-full font-sans">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                        <h2 className="text-2xl font-bold text-gray-900">{t('cart_title')}</h2>
                        <button
                            onClick={toggleCart}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                        {items.length === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-6xl mb-6 block opacity-20">🛒</span>
                                <p className="text-gray-500 font-medium text-lg">{t('cart_empty')}</p>
                                <button
                                    onClick={toggleCart}
                                    className="mt-6 text-brand-gold font-bold hover:text-brand-dark transition-colors uppercase tracking-wide text-sm"
                                >
                                    {t('cart_continue')}
                                </button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-24 h-24 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-2xl">📦</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>

                                            {/* Extra Info Badges */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {item.storeName && (
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                                        {item.storeName}
                                                    </span>
                                                )}
                                                {item.category && (
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-brand-gold font-black text-lg">
                                                {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-gray-100 rounded-full px-2 py-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 shadow-sm text-gray-600 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 shadow-sm text-gray-600 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-400 text-xs font-bold hover:text-red-600 transition-colors uppercase tracking-wider"
                                            >
                                                {t('cart_remove')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer - Delivery Options & Total */}
                    {items.length > 0 && (
                        <div className="p-6 border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-10">

                            <div className="mb-6">
                                <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">{t('cart_delivery_method')}</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setDeliveryMethod('DELIVERY')}
                                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${deliveryMethod === 'DELIVERY'
                                            ? 'border-brand-gold bg-yellow-50 text-brand-dark ring-1 ring-brand-gold'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                    >
                                        <Truck className={`w-5 h-5 ${deliveryMethod === 'DELIVERY' ? 'text-brand-dark' : 'text-gray-400'}`} />
                                        <div className="text-center">
                                            <span className="block text-xs font-bold">{t('cart_delivery')}</span>
                                            <span className="block text-[10px] opacity-75">+ {formatPrice(deliveryFeeAOA)}</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setDeliveryMethod('PICKUP')}
                                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${deliveryMethod === 'PICKUP'
                                            ? 'border-brand-gold bg-yellow-50 text-brand-dark ring-1 ring-brand-gold'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                            }`}
                                    >
                                        <Store className={`w-5 h-5 ${deliveryMethod === 'PICKUP' ? 'text-brand-dark' : 'text-gray-400'}`} />
                                        <div className="text-center">
                                            <span className="block text-xs font-bold">{t('cart_pickup')}</span>
                                            <span className="block text-[10px] opacity-75">{t('cart_free')}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{t('cart_subtotal')}</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>{t('cart_delivery_fee')}</span>
                                    <span className={deliveryMethod === 'DELIVERY' ? 'text-gray-900 font-medium' : 'text-green-600 font-medium'}>
                                        {deliveryMethod === 'DELIVERY' ? `+ ${formatPrice(deliveryFeeAOA)}` : t('cart_free')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="text-lg font-bold text-gray-900">{t('cart_total')}</span>
                                    <span className="text-2xl font-black text-brand-dark">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    toggleCart()
                                    window.location.href = `/checkout?method=${deliveryMethod}`
                                }}
                                className="block w-full bg-green-600 text-white text-center font-black uppercase tracking-widest py-4 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-900/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
                            >
                                {t('cart_checkout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
