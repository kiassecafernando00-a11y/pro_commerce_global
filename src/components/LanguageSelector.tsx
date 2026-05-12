"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { useCurrency } from "@/contexts/CurrencyContext"
import { ChevronDown, Settings, Globe } from "lucide-react"
import { useState, useRef, useEffect } from "react"

interface LanguageSelectorProps {
    variant?: 'dropdown' | 'gear' | 'simple'
    showCurrency?: boolean
    placement?: 'top' | 'bottom'
}

export function LanguageSelector({ variant = 'dropdown', showCurrency = false, placement = 'bottom' }: LanguageSelectorProps) {
    const { language, setLanguage, getFlag } = useLanguage()
    const { currency, setCurrency, getCurrencyFlag } = useCurrency()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const languages = ['PT', 'EN', 'FR', 'ES', 'CN', 'RU'] as const
    const currencies = ['AOA', 'USD', 'EUR', 'BRL'] as const

    if (variant === 'simple') {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                    <img src={getFlag(language)} alt={language} className="w-5 h-auto rounded-sm shadow-sm" />
                    <span className="text-sm font-bold text-gray-700">{language}</span>
                </button>
            </div>
        )
    }

    if (variant === 'gear') {
        return (
            <div className="relative" ref={containerRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    title="Idioma e Moeda"
                >
                    <Settings className="w-5 h-5" />
                </button>

                {isOpen && (
                    <div className={`absolute right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in ${placement === 'top'
                            ? 'bottom-full mb-2 slide-in-from-bottom-2'
                            : 'top-full mt-2 slide-in-from-top-2'
                        }`}>
                        <div className="p-3 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Configurações Regionais</h3>
                        </div>

                        <div className="p-2">
                            <p className="text-xs text-gray-400 font-bold px-2 py-1">Idioma</p>
                            <div className="grid grid-cols-3 gap-1 mb-2">
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${language === lang ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <img src={getFlag(lang)} alt={lang} className="w-6 h-auto rounded-sm shadow-sm mb-1" />
                                        <span className={`text-[10px] font-bold ${language === lang ? 'text-blue-700' : 'text-gray-500'}`}>{lang}</span>
                                    </button>
                                ))}
                            </div>

                            {showCurrency && (
                                <>
                                    <div className="my-2 border-t border-gray-100"></div>
                                    <p className="text-xs text-gray-400 font-bold px-2 py-1">Moeda</p>
                                    <div className="grid grid-cols-2 gap-1">
                                        {currencies.map(curr => (
                                            <button
                                                key={curr}
                                                onClick={() => setCurrency(curr)}
                                                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${currency === curr ? 'bg-green-50 border border-green-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                                            >
                                                <img src={getCurrencyFlag(curr)} alt={curr} className="w-4 h-auto rounded-sm" />
                                                <span className={`text-xs font-bold ${currency === curr ? 'text-green-700' : 'text-gray-500'}`}>{curr}</span>
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Default Dropdown
    return (
        <div className="relative group" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all"
            >
                <img src={getFlag(language)} alt={language} className="w-5 h-auto rounded-sm shadow-sm" />
                <span className="text-sm font-semibold text-gray-700">{language}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => {
                                setLanguage(lang)
                                setIsOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0 ${language === lang ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600'}`}
                        >
                            <img src={getFlag(lang)} alt={lang} className="w-5 h-auto rounded-sm shadow-sm" />
                            <span className="text-sm">{lang}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
