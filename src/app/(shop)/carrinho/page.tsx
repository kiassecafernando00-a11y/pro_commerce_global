"use client"

import { useCart } from "@/contexts/CartContext"
import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, total, clearCart } = useCart()
    const { t } = useLanguage()

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cart_title')}</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <span className="text-6xl mb-6 block">🛒</span>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart_empty_title')}</h2>
                        <p className="text-gray-600 mb-8">{t('cart_empty_desc')}</p>
                        <Link
                            href="/produtos"
                            className="inline-block bg-brand-gold text-brand-dark px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                        >
                            {t('cart_view_products')}
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-6 items-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-3xl">📦</div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                                        <p className="text-xl font-bold text-brand-gold mb-2">
                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: item.currency || 'AOA' }).format(item.price)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remover"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={clearCart}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                                {t('cart_clear')}
                            </button>
                        </div>

                        {/* Summary */}
                        <div className="lg:w-96">
                            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart_summary')}</h2>

                                <div className="space-y-3 text-sm text-gray-600 border-b border-gray-200 pb-4 mb-4">
                                    <div className="flex justify-between">
                                        <span>{t('cart_subtotal')}</span>
                                        <span>{new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(total)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{t('cart_delivery')}</span>
                                        <span className="text-green-600">{t('cart_free')}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold text-gray-900">{t('cart_total')}</span>
                                    <span className="text-2xl font-bold text-brand-gold">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(total)}
                                    </span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full bg-brand-gold text-brand-dark text-center font-bold py-4 rounded-lg hover:bg-yellow-400 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    {t('cart_checkout')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

