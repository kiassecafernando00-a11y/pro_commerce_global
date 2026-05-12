
"use client"

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useState } from "react"
import { CheckCircle2, AlertCircle, CreditCard } from "lucide-react"

interface StripePaymentFormProps {
    amount: number
    currency: string
    onSuccess: (paymentId: string) => void
    onError: (msg: string) => void
}

export function StripePaymentForm({ amount, currency, onSuccess, onError }: StripePaymentFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements) return

        setLoading(true)

        try {
            // 1. Create PaymentIntent on Backend
            const res = await fetch("/api/payment/stripe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount, currency })
            })
            const data = await res.json()

            if (data.error) throw new Error(data.error)

            // 2. Confirm Card Payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                }
            })

            if (result.error) {
                throw new Error(result.error.message)
            } else if (result.paymentIntent?.status === "succeeded") {
                onSuccess(result.paymentIntent.id)
            }

        } catch (err: any) {
            onError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-sm">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#9e2146' },
                    },
                }} />
            </div>

            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? "Processando..." : (
                    <>
                        <CreditCard className="w-5 h-5" />
                        Pagar {new Intl.NumberFormat('pt-AO', { style: 'currency', currency }).format(amount)}
                    </>
                )}
            </button>

            <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" /> Pagamento Processado via Stripe (Seguro)
            </div>
        </form>
    )
}
