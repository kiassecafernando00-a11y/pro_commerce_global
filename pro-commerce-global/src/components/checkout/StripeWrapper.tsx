
"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { ReactNode } from "react"

// This key should be in env, but for demo we can use a test key or placeholder
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

export function StripeWrapper({ children }: { children: ReactNode }) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    )
}
