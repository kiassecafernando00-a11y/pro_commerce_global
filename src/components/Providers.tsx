"use client"

import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/contexts/CartContext"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { CurrencyProvider } from "@/contexts/CurrencyContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <CurrencyProvider>
                    <CartProvider>
                        <WishlistProvider>
                            {children}
                        </WishlistProvider>
                    </CartProvider>
                </CurrencyProvider>
            </LanguageProvider>
        </SessionProvider>
    )
}
