"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export interface CartItem {
    id: string
    name: string
    price: number
    image?: string
    quantity: number
    storeId: string
    currency: string
    storeName?: string
    category?: string
}

interface CartContextType {
    items: CartItem[]
    addToCart: (item: Omit<CartItem, "quantity">) => void
    removeFromCart: (itemId: string) => void
    updateQuantity: (itemId: string, quantity: number) => void
    clearCart: () => void
    total: number
    itemCount: number
    isOpen: boolean
    toggleCart: () => void
    checkout: (payload: {
        deliveryMethod: string
        address?: any
        paymentMethod: string
        deliveryFee?: number
        couponCode?: string
        discount?: number
    }) => Promise<{ success: boolean; orderId?: string }>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("cart")
            if (savedCart) {
                setItems(JSON.parse(savedCart))
            }
        } catch (error) {
            console.error("Failed to load cart from localStorage", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart", JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === newItem.id)
            if (existingItem) {
                return currentItems.map(item =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...currentItems, { ...newItem, quantity: 1 }]
        })
        setIsOpen(true)
    }

    const removeFromCart = (itemId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId))
    }

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId)
            return
        }
        setItems(currentItems =>
            currentItems.map(item =>
                item.id === itemId
                    ? { ...item, quantity }
                    : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const toggleCart = () => setIsOpen(prev => !prev)

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    if (!isLoaded) {
        return null // or a loading spinner
    }

    const checkout = async (payload: {
        deliveryMethod: string
        address?: any
        paymentMethod: string
        deliveryFee?: number
        couponCode?: string
        discount?: number
    }) => {
        try {
            const res = await fetch("/api/orders/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    total,
                    currency: "AOA",
                    ...payload
                })
            })

            const data = await res.json()

            clearCart()
            // Do not toggle cart here, we might be on a page
            return { success: true, orderId: data.orderId }
        } catch (error) {
            console.error("Checkout error:", error)
            alert(error instanceof Error ? error.message : "Erro ao processar checkout")
            return { success: false }
        }
    }

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            checkout,
            total,
            itemCount,
            isOpen,
            toggleCart
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
