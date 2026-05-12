"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Currency = 'AOA' | 'USD' | 'EUR' | 'BRL'

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    formatPrice: (priceInAOA: number) => string
    exchangeRates: Record<Currency, number>
    getCurrencyFlag: (currency: Currency) => string
}

// Default Exchange Rates (Base: AOA)
// These should ideally come from the database/API managed by the Admin
const DEFAULT_RATES: Record<Currency, number> = {
    AOA: 1,
    USD: 1 / 950, // 1 USD = 950 AOA
    EUR: 1 / 1050, // 1 EUR = 1050 AOA
    BRL: 1 / 180   // 1 BRL = 180 AOA
}

const CURRENCY_FLAGS: Record<Currency, string> = {
    AOA: "https://flagcdn.com/w40/ao.png",
    USD: "https://flagcdn.com/w40/us.png",
    EUR: "https://flagcdn.com/w40/eu.png",
    BRL: "https://flagcdn.com/w40/br.png"
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("AOA")
    const [exchangeRates, setExchangeRates] = useState<Record<Currency, number>>(DEFAULT_RATES)

    // Load saved currency and fetch rates
    useEffect(() => {
        const savedCurrency = localStorage.getItem("app_currency") as Currency
        if (savedCurrency && DEFAULT_RATES[savedCurrency]) {
            setCurrency(savedCurrency)
        }

        // Fetch live rates
        import("@/app/actions/public").then(({ getExchangeRates }) => {
            getExchangeRates().then(rates => {
                if (rates && Object.keys(rates).length > 0) {
                    setExchangeRates(prev => ({ ...prev, ...rates }))
                }
            }).catch(console.error)
        })
    }, [])

    const handleSetCurrency = (newCurrency: Currency) => {
        setCurrency(newCurrency)
        localStorage.setItem("app_currency", newCurrency)
    }

    const formatPrice = (priceInAOA: number) => {
        if (isNaN(priceInAOA) || priceInAOA === null) return "0.00"

        const rate = exchangeRates[currency]
        const convertedPrice = priceInAOA * rate

        return new Intl.NumberFormat(getLocaleForCurrency(currency), {
            style: 'currency',
            currency: currency
        }).format(convertedPrice)
    }

    const getCurrencyFlag = (currency: Currency) => CURRENCY_FLAGS[currency]

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, exchangeRates, getCurrencyFlag }}>
            {children}
        </CurrencyContext.Provider>
    )
}

function getLocaleForCurrency(currency: Currency): string {
    switch (currency) {
        case 'AOA': return 'pt-AO'
        case 'USD': return 'en-US'
        case 'EUR': return 'pt-PT' // or de-DE, fr-FR
        case 'BRL': return 'pt-BR'
        default: return 'pt-AO'
    }
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider")
    }
    return context
}
