"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface WishlistItem {
    id: string
    name: string
    price: number
    image?: string
}

interface WishlistContextType {
    items: WishlistItem[]
    addToWishlist: (item: WishlistItem) => void
    removeFromWishlist: (itemId: string) => void
    isInWishlist: (itemId: string) => boolean
    toggleWishlist: (item: WishlistItem) => void
    count: number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<WishlistItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem("wishlist")
            if (saved) {
                setItems(JSON.parse(saved))
            }
        } catch (error) {
            console.error("Failed to load wishlist", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("wishlist", JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addToWishlist = (item: WishlistItem) => {
        setItems(prev => {
            if (prev.some(i => i.id === item.id)) return prev
            return [...prev, item]
        })
    }

    const removeFromWishlist = (itemId: string) => {
        setItems(prev => prev.filter(i => i.id !== itemId))
    }

    const isInWishlist = (itemId: string) => {
        return items.some(i => i.id === itemId)
    }

    const toggleWishlist = (item: WishlistItem) => {
        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id)
        } else {
            addToWishlist(item)
        }
    }

    return (
        <WishlistContext.Provider value={{
            items,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            count: items.length
        }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider")
    }
    return context
}
