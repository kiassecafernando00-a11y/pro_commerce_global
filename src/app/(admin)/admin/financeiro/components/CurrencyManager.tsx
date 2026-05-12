
'use client'

import { useState } from "react"
import { RefreshCw, Save, Check, AlertCircle } from "lucide-react"
import { updateExchangeRate, toggleCurrencyStatus, seedDefaultCurrencies } from "../actions"

type Currency = {
    id: string
    code: string
    name: string
    symbol: string
    exchangeRateToAOA: any // Decimal
    isActive: boolean
    updatedAt: Date
}

export function CurrencyManager({ currencies }: { currencies: Currency[] }) {
    return (
        <div className="space-y-4">
            {currencies.map(currency => (
                <CurrencyRow key={currency.id} currency={currency} />
            ))}
            {currencies.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm mb-3">Nenhuma moeda configurada.</p>
                    <form action={async () => {
                        await seedDefaultCurrencies()
                    }}>
                        <button type="submit" className="bg-brand-gold text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-brand-dark transition-colors">
                            Inicializar Moedas Padrão (AOA/USD/EUR)
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

function CurrencyRow({ currency }: { currency: Currency }) {
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState<"none" | "success" | "error">("none")

    async function handleUpdate(formData: FormData) {
        setLoading(true)
        setFeedback("none")
        const res = await updateExchangeRate(formData)
        setLoading(false)
        if (res.success) {
            setFeedback("success")
            setTimeout(() => setFeedback("none"), 3000)
        } else {
            setFeedback("error")
        }
    }

    const isBase = currency.code === "AOA"

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg font-bold text-sm ${currency.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                    {currency.code}
                </div>
                <div>
                    <p className="font-bold text-gray-800">{currency.name}</p>
                    <p className="text-xs text-gray-500">Última atualização: {new Date(currency.updatedAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isBase ? (
                    <div className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md">
                        Moeda Base (1.00)
                    </div>
                ) : (
                    <form action={handleUpdate} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={currency.id} />
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-xs font-bold">1 {currency.symbol} =</span>
                            <input
                                name="rate"
                                type="number"
                                step="0.01"
                                defaultValue={Number(currency.exchangeRateToAOA)}
                                className="w-40 pl-16 pr-3 py-1.5 text-sm font-bold border rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="absolute right-3 top-2 text-gray-500 text-xs font-bold">Kz</span>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="p-2 bg-slate-900 text-white rounded-md hover:bg-black disabled:opacity-50 transition-colors"
                            title="Atualizar Taxa"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                    </form>
                )}

                {feedback === 'success' && <Check className="w-4 h-4 text-green-500 animate-bounce" />}
                {feedback === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
        </div>
    )
}
