
"use server"

import { prisma } from "@/lib/prisma"

export async function getActivePaymentMethods() {
    const methods = await prisma.paymentMethodConfig.findMany({
        where: { isActive: true }
    })
    return methods.map(m => m.provider) // Returns ['STRIPE', 'BINANCE'] etc.
}

export async function getPublicSystemConfig() {
    return await prisma.systemConfig.findUnique({
        where: { id: "global" },
        select: {
            appName: true,
            supportEmail: true,
            supportPhone: true,
            address: true,
            maintenanceMode: true,
            socialFacebook: true,
            socialInstagram: true,
            socialLinkedin: true,
            socialTiktok: true,
            socialYoutube: true
        }
    })
}

export async function getExchangeRates() {
    try {
        // 1. Fetch active currencies
        const currencies = await prisma.currency.findMany({
            where: { isActive: true }
        })

        if (currencies.length === 0) return {}

        // 2. Check if update is needed (older than 1 hour)
        const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 Hour
        const oldestUpdate = currencies.reduce((oldest, curr) => {
            return curr.updatedAt < oldest ? curr.updatedAt : oldest
        }, new Date())

        const isStale = (new Date().getTime() - oldestUpdate.getTime()) > CACHE_DURATION_MS

        if (isStale) {
            console.log("[ExchangeRates] Rates are stale. Fetching live data...")
            try {
                // 3. Fetch live rates (Base USD)
                const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 60 } })
                if (res.ok) {
                    const data = await res.json()
                    const rates = data.rates // { USD: 1, AOA: 950, EUR: 0.92, BRL: 5.0 }

                    if (rates && rates.AOA) {
                        const usdToAOA = rates.AOA

                        // 4. Update Database
                        // We need to calculate exchangeRateToAOA (Value of 1 Currency Unit in AOA)
                        // Formula: 1 Unit = (1 / RateInUSD) * RateAOAinUSD

                        // DB Transactions for safety
                        await prisma.$transaction(currencies.map(c => {
                            if (c.code === 'AOA') return prisma.currency.update({ where: { id: c.id }, data: { exchangeRateToAOA: 1 } })

                            const rateInUSD = rates[c.code]
                            if (rateInUSD) {
                                // e.g. EUR (0.92). 1 EUR = (1/0.92) * 950 = 1032 AOA
                                const newRateToAOA = (1 / rateInUSD) * usdToAOA
                                return prisma.currency.update({
                                    where: { id: c.id },
                                    data: { exchangeRateToAOA: newRateToAOA }
                                })
                            }
                            return prisma.currency.update({ where: { id: c.id }, data: {} }) // No-op if rate not found
                        }))
                        console.log("[ExchangeRates] Rates updated successfully.")

                        // Re-fetch updated currencies
                        const updatedCurrencies = await prisma.currency.findMany({ where: { isActive: true } })
                        return convertToMultipliers(updatedCurrencies)
                    }
                }
            } catch (error) {
                console.error("[ExchangeRates] Failed to fetch live rates:", error)
            }
        }

        return convertToMultipliers(currencies)
    } catch (e) {
        console.error("Error getting exchange rates", e)
        return {}
    }
}

function convertToMultipliers(currencies: any[]) {
    const rates: Record<string, number> = {}
    currencies.forEach(c => {
        const rateToAOA = Number(c.exchangeRateToAOA)
        // Frontend uses multiplier: PriceInAOA * Multiplier = PriceInTarget
        // So Multiplier = 1 / rateToAOA
        rates[c.code] = rateToAOA > 0 ? 1 / rateToAOA : 0
    })
    return rates
}

export async function getActiveBanners() {
    return await prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' } // or createdAt desc
    })
}

export async function getActiveCampaigns() {
    return await prisma.campaign.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 3
    })
}

export async function getActiveCategories() {
    return await prisma.category.findMany({
        orderBy: { name: 'asc' }
    })
}
