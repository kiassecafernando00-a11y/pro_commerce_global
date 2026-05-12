"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { useWishlist } from "@/contexts/WishlistContext"
import { Search, User, Heart, ShoppingCart, Menu, Phone, Truck, Zap, LayoutGrid, ArrowRight, ChevronDown, Laptop } from "lucide-react"

interface HeaderProps {
    systemConfig: any
    categories: any[]
}

export function Header({ systemConfig, categories = [] }: HeaderProps) {
    const { toggleCart, itemCount } = useCart()
    const { data: session } = useSession()
    const { language, setLanguage, t, getFlag } = useLanguage()
    const { currency, setCurrency, getCurrencyFlag } = useCurrency()
    const { count: wishlistCount } = useWishlist()

    const [isDeptOpen, setIsDeptOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()

    const handleSearch = () => {
        if (searchQuery.trim()) {
            router.push(`/produtos?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <header className="flex flex-col w-full font-sans z-50 relative shadow-sm transition-all duration-300 sticky top-0">
            {/* 1. Top Strip - Dark Blue (Utilities) */}
            <div className="bg-gray-100 text-gray-600 py-1.5 px-4 text-xs font-medium border-b border-gray-200 hidden md:block">
                <div className="container mx-auto flex justify-between items-center">
                    {/* Left: Language/Currency */}
                    <div className="flex items-center gap-4 relative z-50">
                        {/* Language Dropdown */}
                        <div className="relative group">
                            <button className="hover:text-blue-700 transition-colors flex items-center gap-1.5 focus:outline-none py-1">
                                <img src={getFlag(language)} alt={language} className="w-5 h-auto rounded-sm shadow-sm opacity-90" />
                                <span className="text-xs font-semibold">{language}</span>
                                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                            </button>

                            {/* Dropdown with Hover Bridge */}
                            <div className="absolute top-full left-0 pt-2 w-32 hidden group-hover:block z-50">
                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                    {(['PT', 'EN', 'FR', 'ES', 'CN', 'RU'] as const).map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => setLanguage(lang)}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors ${language === lang ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600'}`}
                                        >
                                            <img src={getFlag(lang)} alt={lang} className="w-5 h-auto rounded-sm shadow-sm" />
                                            <span className="text-sm">{lang}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <span className="text-gray-300">|</span>

                        {/* Currency Dropdown */}
                        <div className="relative group">
                            <button className="hover:text-blue-700 transition-colors flex items-center gap-1.5 focus:outline-none py-1">
                                <img src={getCurrencyFlag(currency)} alt={currency} className="w-5 h-auto rounded-sm shadow-sm opacity-90" />
                                <span className="text-xs font-semibold">{currency}</span>
                                <ChevronDown className="w-3 h-3 transition-transform group-hover:rotate-180" />
                            </button>

                            {/* Dropdown with Hover Bridge */}
                            <div className="absolute top-full left-0 pt-2 w-32 hidden group-hover:block z-50">
                                <div className="bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-1">
                                    {(['AOA', 'USD', 'EUR', 'BRL'] as const).map((curr) => (
                                        <button
                                            key={curr}
                                            onClick={() => setCurrency(curr)}
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors ${currency === curr ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600'}`}
                                        >
                                            <img src={getCurrencyFlag(curr)} alt={curr} className="w-5 h-auto rounded-sm shadow-sm" />
                                            <span className="text-sm">{curr}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-6">
                        {systemConfig?.supportPhone && (
                            <Link href="/info" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
                                <Phone className="w-3.5 h-3.5" /> <span>{systemConfig.supportPhone}</span>
                            </Link>
                        )}
                        <Link href="/rastrear" className="flex items-center gap-1 hover:text-blue-700 transition-colors">
                            <Truck className="w-3.5 h-3.5" /> <span>{t('header_track')}</span>
                        </Link>
                        {session?.user?.role === "ADMIN" && (
                            <Link href="/admin" className="flex items-center gap-1 text-blue-700 font-bold">
                                <span>ADMIN</span>
                                <User className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Main Header - White (Logo, Search, Actions) */}
            <div className="bg-white py-4 px-6 shadow-sm z-20 relative">
                <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo */}
                    <Link href="/" className="group flex flex-col items-center md:items-start leading-none gap-0.5">
                        <div className="text-2xl md:text-3xl font-black tracking-tighter text-blue-900 italic transform -skew-x-6 flex items-baseline">
                            Pro<span className="text-brand-gold">Commerce</span>Global
                        </div>
                        <span className="text-[10px] tracking-widest text-gray-400 font-bold uppercase group-hover:text-brand-gold transition-colors">Angola</span>
                    </Link>

                    {/* Search Bar - Advanced with Dropdown */}
                    <div className="flex-1 max-w-2xl w-full relative group z-30">
                        <div className="flex bg-gray-50 border-2 border-gray-200 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-full overflow-hidden transition-all duration-300">
                            <input
                                type="text"
                                placeholder={t('header_search')}
                                className="flex-1 bg-transparent px-6 py-2.5 outline-none text-gray-700 placeholder-gray-400 text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 flex items-center justify-center transition-colors font-bold tracking-wide"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search Dropdown Results (Mock UI) */}
                        {searchQuery.length > 2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 p-4 hidden group-focus-within:block hover:block">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">{t('header_suggestions')}</p>
                                <div className="space-y-1">
                                    <Link href={`/produtos?q=${searchQuery}`} className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer group/item">
                                        <div className="p-2 bg-gray-100 rounded-lg text-gray-400 group-hover/item:text-blue-600">
                                            <Search className="w-4 h-4" />
                                        </div>
                                        <span className="text-gray-700 font-medium group-hover/item:text-blue-700">{t('header_search_for')} <span className="font-bold">"{searchQuery}"</span></span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions (Support, Account, Wishlist, Cart) */}
                    <div className="flex items-center gap-4 text-gray-600">

                        {/* Account Dropdown */}
                        <div className="relative group/account">
                            <Link
                                href={session ? (session.user?.role === "VENDOR" ? "/dashboard" : "/minhas-compras") : "/auth/login"}
                                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col leading-tight text-xs hidden sm:flex">
                                    <span className="text-gray-400">{t('header_welcome')}, {session ? session.user?.name?.split(' ')[0] : 'Visitante'}</span>
                                    <span className="font-bold text-gray-800 text-sm">{session ? t('header_account') : t('btn_login')}</span>
                                </div>
                            </Link>

                            {/* Dropdown Menu */}
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover/account:block animate-in fade-in slide-in-from-top-2 p-1">
                                {session ? (
                                    <>
                                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                                            <p className="text-sm font-bold text-gray-900 truncate">{session.user?.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                                        </div>
                                        <div className="p-1">
                                            <Link href="/minhas-compras" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                                                <Truck className="w-4 h-4" /> {t('nav_my_orders')}
                                            </Link>
                                            <Link href="/favoritos" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg">
                                                <Heart className="w-4 h-4" /> Meus Favoritos
                                                {/* TODO: Add 'My Favorites' key if missing */}
                                            </Link>
                                            {session.user?.role === "VENDOR" && (
                                                <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm text-brand-gold font-bold hover:bg-yellow-50 rounded-lg">
                                                    <Zap className="w-4 h-4" /> {t('dash_overview')}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="border-t border-gray-100 p-1">
                                            <button onClick={() => signOut()} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                                                {t('btn_logout')}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-3">
                                        <Link href="/auth/login" className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors mb-2">
                                            {t('btn_login')}
                                        </Link>
                                        <Link href="/auth/register" className="flex items-center justify-center w-full bg-gray-100 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-200 transition-colors">
                                            {t('btn_register')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Link href="/favoritos" className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors group">
                            <Heart className="w-6 h-6 group-hover:text-red-500 transition-colors" />
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                                {wishlistCount}
                            </span>
                        </Link>

                        {/* Cart with Mini-Cart Preview */}
                        <div className="relative group/cart">
                            <button onClick={toggleCart} className="relative p-2 hover:bg-gray-50 rounded-xl transition-colors flex items-center gap-2 group">
                                <div className="relative">
                                    <ShoppingCart className="w-6 h-6 group-hover:text-blue-600 transition-colors" />
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white group-hover:scale-110 transition-transform">
                                        {itemCount}
                                    </span>
                                </div>
                            </button>
                            {/* Mini Cart Tooltip */}
                            <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover/cart:block animate-in fade-in slide-in-from-top-2 p-4 z-50">
                                <p className="text-sm font-bold text-gray-900 mb-2">{t('cart_title')}</p>
                                <p className="text-xs text-gray-500 mb-3">{itemCount} itens adicionados</p>
                                <button onClick={toggleCart} className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                                    {t('cart_checkout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Nav - White with separator */}
            <div className="bg-white border-t border-gray-100 hidden md:block z-10">
                <div className="container mx-auto px-6">
                    <nav className="flex items-center gap-8 text-sm font-bold text-gray-600 uppercase tracking-tight py-3">
                        {/* Departments Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDeptOpen(!isDeptOpen)}
                                className={`flex items-center gap-2 text-white px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-900/20 active:scale-95 select-none ${isDeptOpen ? 'bg-blue-800 ring-2 ring-blue-500/50' : 'bg-blue-900 hover:bg-blue-800'}`}
                            >
                                <Menu className="w-5 h-5" />
                                <span className="font-bold">{t('header_depts')}</span>
                            </button>

                            {/* Transparent Backdrop to close on click outside */}
                            {isDeptOpen && (
                                <div
                                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                                    onClick={() => setIsDeptOpen(false)}
                                    aria-hidden="true"
                                ></div>
                            )}

                            {/* Dropdown Body */}
                            {isDeptOpen && (
                                <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 overflow-y-auto max-h-[80vh] custom-scrollbar">
                                        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('header_menu_cats')}</span>
                                            <Link
                                                href="/categorias"
                                                className="text-xs text-blue-600 font-bold hover:underline"
                                                onClick={() => setIsDeptOpen(false)}
                                            >
                                                {t('header_all_cats')}
                                            </Link>
                                        </div>

                                        {categories.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-1">
                                                {categories.map((cat) => {
                                                    // Normalize slug or name to a key format (e.g. "beleza-saude" -> "cat_beleza_saude")
                                                    const keySuffix = (cat.slug || cat.name)
                                                        .toLowerCase()
                                                        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                                                        .replace(/-/g, '_')
                                                        .replace(/&/g, '')
                                                        .replace(/\s+/g, '_')
                                                        .replace(/_+/g, '_');

                                                    const transKey = `cat_${keySuffix}`;
                                                    const translatedName = t(transKey);
                                                    const displayName = translatedName !== transKey ? translatedName : cat.name;

                                                    return (
                                                        <Link
                                                            key={cat.id}
                                                            href={`/produtos?cat=${cat.slug || cat.name.toLowerCase()}`}
                                                            className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group/item"
                                                            onClick={() => setIsDeptOpen(false)}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center group-hover/item:bg-blue-100 group-hover/item:text-blue-600 transition-colors">
                                                                {cat.image ? (
                                                                    <img src={cat.image} alt="" className="w-5 h-5 object-contain" />
                                                                ) : (
                                                                    <LayoutGrid className="w-4 h-4" />
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-base capitalize">{displayName}</span>
                                                            <span className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity text-blue-400">
                                                                <ArrowRight className="w-4 h-4" />
                                                            </span>
                                                        </Link>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center text-gray-400">
                                                <LayoutGrid className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                                <p className="text-xs">Nenhuma categoria</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                                        <Link
                                            href="/categorias"
                                            className="text-sm font-bold text-gray-600 hover:text-brand-dark transition-colors inline-flex items-center gap-2"
                                            onClick={() => setIsDeptOpen(false)}
                                        >
                                            {t('header_explore')} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>


                        <Link href="/produtos?cat=ofertas" className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors whitespace-nowrap animate-pulse ml-auto">
                            <Zap className="w-4 h-4" /> {t('header_deals')}
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    )
}
