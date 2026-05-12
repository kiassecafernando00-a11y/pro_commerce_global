"use client"

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'

interface StripeCheckoutButtonProps {
    items: Array<{
        productId: string
        name: string
        price: number
        quantity: number
        storeId: string
    }>
    deliveryFee: number
    address: any
    deliveryMethod: string
    disabled?: boolean
}

export default function StripeCheckoutButton({
    items,
    deliveryFee,
    address,
    deliveryMethod,
    disabled
}: StripeCheckoutButtonProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCheckout = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/payments/stripe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items,
                    deliveryFee,
                    address,
                    deliveryMethod
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pagamento')
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleCheckout}
                disabled={disabled || loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processando...
                    </>
                ) : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pagar com Cartão (Stripe)
                    </>
                )}
            </button>
            {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {error}
                </p>
            )}
        </div>
    )
}
