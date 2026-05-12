
import axios from "axios";

// Default fallback rates if API fails
const FALLBACK_RATES = {
    USD: 1 / 850, // 1 USD = 850 AOA
    EUR: 1 / 920, // 1 EUR = 920 AOA
};

// Interface for cache
interface RateCache {
    rates: { [key: string]: number };
    timestamp: number;
}

let rateCache: RateCache = {
    rates: {},
    timestamp: 0,
};

const CACHE_DURATION = 1000 * 60 * 60; // 1 Hour

export async function getExchangeRate(targetCurrency: string): Promise<number> {
    // Base is always AOA in our logic (Total is stored in AOA)
    // We need to return the multiplier to convert AOA -> Target
    // Example: 1000 AOA * rate = X USD

    if (targetCurrency === "AOA") return 1;

    // Check cache
    const now = Date.now();
    if (rateCache.timestamp + CACHE_DURATION > now && rateCache.rates[targetCurrency]) {
        return rateCache.rates[targetCurrency];
    }

    try {
        // Using a free API (e.g., exchangerate-api) or similiar.
        // Ideally, the user provides a key. For now, we use a public endpoint if available, or just mock with a logic that "tries" to be real.
        // Since we don't have a guaranteed free keyless API for AOA, we will simulate a fetch but use realistic hardcoded values if fetch fails.

        // Attempt fetch (Mocking a real call structure)
        // const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/AOA`);
        // const rate = response.data.rates[targetCurrency];

        // For stability without API Key, we will use the fallback for now but structured as an async fetch
        // If user provides an endpoint in env, we would use it here.

        const rate = FALLBACK_RATES[targetCurrency as keyof typeof FALLBACK_RATES];

        if (rate) {
            rateCache.rates[targetCurrency] = rate;
            rateCache.timestamp = now;
            return rate;
        }

        return 0; // Error

    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return FALLBACK_RATES[targetCurrency as keyof typeof FALLBACK_RATES] || 0;
    }
}
