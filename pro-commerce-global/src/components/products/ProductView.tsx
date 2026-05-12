"use client"

import { useCart } from "@/contexts/CartContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useLanguage } from "@/contexts/LanguageContext"

interface Product {
    id: string
    name: string
    description: string
    price: number
    currency: string
    stock: number
    images: string
    category: string
    store: {
        name: string
        id: string
        description: string | null
    }
}

export default function ProductView({ product }: { product: Product }) {
    const { addToCart } = useCart()
    const { formatPrice } = useCurrency()
    const { t } = useLanguage()

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Imagem */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-center aspect-square">
                {product.images ? (
                    <img
                        src={product.images}
                        alt={product.name}
                        className="w-full h-full object-contain rounded-xl"
                    />
                ) : (
                    <div className="text-9xl">📦</div>
                )}
            </div>

            {/* Detalhes */}
            <div className="flex flex-col">
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium mb-3">
                        {product.category || t('prod_default_category')}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="text-3xl font-bold text-brand-dark">
                            {formatPrice(product.price)}
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}>
                            {product.stock > 0 ? `${product.stock} ${t('prod_units')}` : t('prod_out_stock')}
                        </div>
                    </div>
                </div>

                <div className="prose prose-gray max-w-none mb-8">
                    <h3 className="text-lg font-semibold mb-2">{t('prod_description')}</h3>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {product.description}
                    </p>
                </div>

                <div className="mt-auto border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-dark font-bold">
                                {product.store.name.substring(0, 1)}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('prod_sold_by')}</p>
                                <p className="font-semibold text-gray-900">{product.store.name}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images,
                            storeId: product.store.id,
                            storeName: product.store.name,
                            category: product.category,
                            currency: product.currency
                        })}
                        disabled={product.stock === 0}
                        className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-gold/20 text-lg"
                    >
                        {product.stock > 0 ? t('prod_add_to_cart') : t('prod_unavailable')}
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-4">
                        {t('prod_secure_transaction')}
                    </p>
                </div>
            </div>
        </div>
    )
}
