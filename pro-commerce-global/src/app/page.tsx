"use client"

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import HeroBanners from "@/components/home/HeroBanners";
import CampaignsRow from "@/components/home/CampaignsRow";
import { getActiveBanners, getActiveCampaigns } from "@/app/actions/public";
import { DEPARTMENTS } from "@/data/categories"
import WishlistButton from "@/components/products/WishlistButton";
import ActiveEventsSection from "@/components/home/ActiveEventsSection";

import {
  Laptop,
  ShoppingBag,
  Armchair,
  Gem,
  Dumbbell,
  Rocket,
  ShieldCheck,
  Globe2,
  TrendingUp,
  ArrowRight,
  Truck,
  Trophy,
  Star,
  Smartphone,
  CreditCard,
  CheckCircle,
  LayoutGrid
} from "lucide-react";

// Helper for safe image parsing
function safeParseImages(images: string): string[] {
  if (!images) return []
  try {
    const parsed = JSON.parse(images)
    if (Array.isArray(parsed)) return parsed
    return [images]
  } catch {
    // If parsing fails, assume it's a single string URL
    return [images]
  }
}

import { useState, useEffect } from "react";

interface Product {
  id: string
  name: string
  price: number
  images: string
  category: string
  store?: {
    name: string
    id: string
  }
}

interface Category {
  id: string
  name: string
  slug: string
  image?: string | null
}

export default function Home() {
  const { t } = useLanguage()
  const { formatPrice } = useCurrency()
  const { toggleCart, addToCart } = useCart()

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [latestProducts, setLatestProducts] = useState<Product[]>([])

  // Dynamic Data State
  const [banners, setBanners] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>(DEPARTMENTS.map(d => ({
    id: d.id,
    name: t(`cat_${d.id.replace(/-/g, '_')}`) || d.label,
    slug: d.slug,
    image: d.image
  })))

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Parallel Fetching for Maximum Speed
        const productsPromise = fetch("/api/products").then(res => res.json())
        const bannersPromise = getActiveBanners()
        const campaignsPromise = getActiveCampaigns()

        const [productData, bannerData, campaignData] = await Promise.all([
          productsPromise,
          bannersPromise,
          campaignsPromise
        ])

        if (productData.products) {
          setFeaturedProducts(productData.products.slice(0, 8)) // Show more featured
          setLatestProducts(productData.products.slice(0, 3))
        }
        setBanners(bannerData)
        setCampaigns(campaignData)
        // setCategories(categoryData) - Using static list

      } catch (error) {
        console.error("Failed to fetch home data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Use DEPARTMENTS directly for categories to match other pages

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50/50">

      <main className="flex-grow">
        {/* HERO SECTION */}
        {banners.length > 0 ? (
          <HeroBanners banners={banners} />
        ) : (
          <section className="relative overflow-hidden bg-[#0F172A] text-white min-h-[600px] flex items-center">
            <div className="absolute inset-0 z-0">
              {/* High Quality Abstract Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-[#0F172A] to-[#0F172A] opacity-90"></div>
              <img src="/hero-bg.png" alt="Background" className="w-full h-full object-cover opacity-20 mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-6 py-20 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 backdrop-blur-sm">
                  <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse"></span>
                  <span className="text-xs font-bold text-blue-200 tracking-widest uppercase">{t('badge_platform') || "PLATAFORMA PREMIUM"}</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-white drop-shadow-xl">
                  {t('hero_title_1') || "O Comércio Global"}<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-200 to-brand-gold bg-[length:200%_auto] animate-gradient">
                    {t('hero_title_2') || "Sem Fronteiras"}
                  </span>
                </h1>

                <p className="text-xl text-blue-100/80 font-medium max-w-lg leading-relaxed">
                  {t('hero_desc') || "Conectamos vendedores e compradores em Angola e no mundo com segurança total."}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href="/produtos" className="px-8 py-4 bg-brand-gold text-brand-dark font-extrabold rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:-translate-y-1 flex items-center gap-2">
                    {t('btn_buy') || "Comprar Agora"} <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/auth/register" className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10 backdrop-blur-sm flex items-center gap-2">
                    {t('btn_become_vendor') || "Vender na Plataforma"}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ACTIVE EVENTS SECTION */}
        <ActiveEventsSection />

        {/* TRUST INDICATORS STRIP */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase">{t('trust_secure_title')}</h4>
                  <p className="text-xs text-gray-500">{t('trust_secure_desc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase">{t('trust_delivery_title')}</h4>
                  <p className="text-xs text-gray-500">{t('trust_delivery_desc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase">{t('trust_payment_title')}</h4>
                  <p className="text-xs text-gray-500">{t('trust_payment_desc')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm uppercase">{t('trust_discount_title')}</h4>
                  <p className="text-xs text-gray-500">{t('trust_discount_desc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CAMPAIGNS & CATEGORIES */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            {campaigns.length > 0 && <div className="mb-16"><CampaignsRow campaigns={campaigns} /></div>}

            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('home_popular_cats')}</h2>
              <Link href="/produtos" className="text-brand-dark font-semibold hover:text-brand-gold transition-colors flex items-center gap-1">{t('cat_view_all')} <ArrowRight className="w-4 h-4" /></Link>
            </div>

            {loading ? (
              <div className="flex gap-4 overflow-hidden py-4">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-40 h-40 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.length > 0 ? categories.map((cat) => (
                  <Link key={cat.id} href={`/produtos?cat=${cat.slug}`} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all text-center flex flex-col items-center gap-4 overflow-hidden">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-inner overflow-hidden border border-gray-100">
                      {cat.image ? (
                        <img src={cat.image} className="w-full h-full object-cover" alt={cat.name} />
                      ) : (
                        <LayoutGrid className="w-8 h-8 text-blue-300" />
                      )}
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-blue-600 transition-colors">{cat.name}</span>
                  </Link>
                )) : (
                  <div className="col-span-full text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
                    Nenhuma categoria encontrada.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* LATEST PRODUCTS (PROMO) */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-brand-gold" /> {t('featured_title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {latestProducts.map(product => (
                <Link key={product.id} href={`/produtos/${product.id}`} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex">
                  <div className="w-1/3 bg-gray-100 relative">
                    {product.images ? (
                      <img src={safeParseImages(product.images)[0] || "/placeholder.png"} className="w-full h-full object-cover" alt={product.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><Smartphone /></div>
                    )}
                  </div>
                  <div className="flex-1 p-5 flex flex-col justify-center">
                    <span className="text-xs font-bold text-blue-500 uppercase mb-1">{product.category}</span>
                    <h3 className="font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-lg font-black text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
              {latestProducts.length === 0 && !loading && (
                <div className="col-span-3 text-center py-10 bg-gray-50 rounded-xl">
                  Ainda não há destaques cadastrados.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURED GRID */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{t('home_explore_news')}</h2>
              <p className="text-gray-500">{t('home_desc_news')}</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 relative">
                    {/* Badge */}
                    {product.store && (
                      <span className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1 rounded-full shadow-sm text-gray-800">
                        {product.store.name}
                      </span>
                    )}

                    <div className="absolute top-4 right-4 z-10">
                      <WishlistButton productId={product.id} />
                    </div>

                    {/* Image Area */}
                    <Link href={`/produtos/${product.id}`} className="block h-64 overflow-hidden bg-gray-100 relative">
                      {product.images ? (
                        <img
                          src={safeParseImages(product.images)[0] || "/placeholder.png"}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          alt={product.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Smartphone size={48} /></div>
                      )}
                      {/* Quick Action Overlay */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: safeParseImages(product.images)[0],
                            storeId: product.store?.id || "admin",
                            storeName: product.store?.name,
                            category: product.category,
                            currency: "AOA"
                          });
                        }}
                        className="absolute bottom-4 right-4 w-10 h-10 bg-brand-gold text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-yellow-500"
                      >
                        <ShoppingBag size={18} />
                      </button>
                    </Link>

                    {/* Content */}
                    <div className="p-5">
                      <Link href={`/produtos/${product.id}`}>
                        <h3 className="font-bold text-gray-900 mb-1 truncate hover:text-blue-600 transition-colors">{product.name}</h3>
                      </Link>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">Em stock</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {featuredProducts.length === 0 && !loading && (
              <div className="text-center py-20 bg-gray-50 rounded-3xl mt-10">
                <p className="text-gray-500">{t('prod_no_featured')}</p>
                <Link href="/auth/register" className="inline-block mt-4 text-blue-600 font-bold hover:underline">{t('home_first_seller')}</Link>
              </div>
            )}

            <div className="text-center mt-16">
              <Link href="/produtos" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-colors">
                {t('home_full_catalog')} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
