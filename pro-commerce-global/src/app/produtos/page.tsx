"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { capitalize } from "@/lib/utils"
// @ts-ignore
import { DEPARTMENTS } from "@/data/categories"
import WishlistButton from "@/components/products/WishlistButton"
// @ts-ignore
import { useLanguage } from "@/contexts/LanguageContext"
import { useCurrency, Currency } from "@/contexts/CurrencyContext"
import { useSearchParams, useRouter } from "next/navigation"

interface Product {
    id: string
    name: string
    description: string
    price: number
    currency: string
    stock: number
    images: string
    store: {
        name: string
    }
}

export default function ProductsMarketplacePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState("all")
    const { addToCart } = useCart()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { t } = useLanguage()
    const { formatPrice, exchangeRates } = useCurrency()

    // Get queries
    const queryCat = searchParams.get("cat")
    const querySearch = searchParams.get("q")

    const CATEGORIES = [
        { id: "all", label: t('common_all') || "Todos" },
        ...DEPARTMENTS.map(d => ({ id: d.slug, label: t(`cat_${d.id.replace(/-/g, '_')}`) || d.label }))
    ]

    useEffect(() => {
        if (queryCat) {
            // Map legacy category names if needed, or use slug directly
            setSelectedCategory(queryCat)
        }
    }, [queryCat])

    useEffect(() => {
        fetchProducts()
    }, [selectedCategory, querySearch])

    async function fetchProducts() {
        setLoading(true)
        try {
            let url = "/api/products?"
            const params = new URLSearchParams()

            if (selectedCategory !== "all") {
                // Determine if we are sending a name or a slug. API supports both.
                // We will send the ID (slug) which is stable.
                params.append("category", selectedCategory)
            }
            if (querySearch) {
                params.append("q", querySearch)
            }

            const response = await fetch(url + params.toString())
            if (response.ok) {
                const data = await response.json()
                setProducts(data.products)
            }
        } catch (error) {
            console.error("Erro ao carregar produtos:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId)
        // Update URL without refreshing
        const newUrl = categoryId === 'all'
            ? '/produtos'
            : `/produtos?cat=${categoryId}`
        router.push(newUrl)
    }

    // Helper to get display name for current category
    const getCurrentCategoryName = () => {
        const cat = CATEGORIES.find(c => c.id === selectedCategory)
        return cat ? cat.label : capitalize(selectedCategory)
    }

    // Helper: Convert product price to AOA (Base) then format to selected currency
    const getFormattedPrice = (product: Product) => {
        // If product currency matches AOA (base), straightforward
        // If product currency is e.g. USD, we convert to AOA first
        if (!exchangeRates) return "0.00"

        const prodCurrency = (product.currency || "AOA") as Currency
        const rateToAOA = exchangeRates[prodCurrency] || 1 // Rate: Currency -> AOA (Wait, DEFAULT_RATES are AOA -> Currency)

        // DEFAULT_RATES definition in CurrencyContext:
        // AOA: 1
        // USD: 1/950 (meaning 1 AOA = 0.00105 USD) OR (1 USD = 950 AOA) ?
        // The comment said: USD: 1 / 950, // 1 USD = 950 AOA
        // So DEFAULT_RATES[USD] stores the value of 1 AOA in USD.
        // So PriceInUSD = PriceInAOA * Rate(1/950).
        // Therefore PriceInAOA = PriceInUSD / Rate(1/950) = PriceInUSD * 950.

        let priceInAOA = product.price
        if (prodCurrency !== "AOA") {
            const rate = exchangeRates[prodCurrency]
            if (rate) {
                priceInAOA = product.price / rate
            }
        }

        return formatPrice(priceInAOA)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Assuming Global Header is handled in Layout */}

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-brand-dark to-brand-medium text-white py-16 px-6">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t('marketplace_title')}
                    </h1>
                    <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                        {t('marketplace_subtitle')}
                    </p>
                </div>
            </section>

            {/* Category Filter */}
            <section className="container mx-auto px-6 py-8 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 justify-center">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category.id
                                ? "bg-brand-gold text-brand-dark"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Products Grid */}
            <section className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">{t('common_loading')}</p>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {t('marketplace_no_products')}
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {t('marketplace_no_products_desc')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {selectedCategory === "all" ? t('marketplace_all_products') : getCurrentCategoryName()} ({products.length})
                            </h2>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/produtos/${product.id}`}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                                >
                                    {/* Product Image */}
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute top-2 right-2 z-10">
                                            <WishlistButton productId={product.id} />
                                        </div>
                                        {product.images ? (
                                            <img
                                                src={product.images}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="text-6xl">📦</div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>

                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="text-2xl font-bold text-brand-dark">
                                                    {getFormattedPrice(product)}
                                                </p>
                                            </div>
                                            <div className={`text-xs px-2 py-1 rounded-full ${product.stock > 0
                                                ? "bg-green-100 text-green-700"
                                                : "bg-red-100 text-red-700"
                                                }`}>
                                                {product.stock > 0 ? t('prod_stock') : t('prod_out_stock')}
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 mb-3">
                                            {t('prod_sold_by')} <span className="font-semibold">{product.store.name}</span>
                                        </p>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault() // Prevent navigation
                                                addToCart({
                                                    id: product.id,
                                                    name: product.name,
                                                    price: product.price,
                                                    image: product.images,
                                                    storeId: product.store.name, // Using store name as ID for now
                                                    currency: product.currency
                                                })
                                            }}
                                            disabled={product.stock === 0}
                                            className="w-full bg-brand-gold text-brand-dark font-bold py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10 relative"
                                        >
                                            {product.stock > 0 ? t('prod_add_to_cart') : t('prod_out_stock')}
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* Footer */}
            <footer className="bg-brand-dark text-gray-300 py-8 px-6 border-t border-white/10 mt-16">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} ProCommerceGlobal. {t('footer_rights')}</p>
                </div>
            </footer>
        </div>
    )
}

