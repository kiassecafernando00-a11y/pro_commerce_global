"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { DollarSign, Package, ShoppingBag, TrendingUp, AlertTriangle } from "lucide-react"

export default function VendorDashboard() {
    const { data: session } = useSession()
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 24, // Mock 
        recentOrders: []
    })
    const [storeStatus, setStoreStatus] = useState("APPROVED")
    const [adminPaymentInfo, setAdminPaymentInfo] = useState("")

    useEffect(() => {
        if (session?.user?.id) {
            // Fetch Dashboard Stats
            fetch("/api/dashboard")
                .then(res => res.json())
                .then(data => {
                    if (data) setStats(data)
                })
                .catch(console.error)

            // Fetch Store Status & Global Settings
            fetchStoreStatus()
        }
    }, [session])

    async function fetchStoreStatus() {
        try {
            // Check Store Status
            const resStore = await fetch("/api/vendor/settings")
            if (resStore.ok) {
                // Note: api/vendor/settings currently returns the store object
                // We might need to ensure it returns 'status' as well. 
                // Currently it selects 'paymentInfo'. Let's check api/vendor/settings again or use a dedicated endpoint.
                // Actually, let's use a specific check or assume we can get it.
                // For now, let's fetch from a new endpoint or existing one.
                // Let's retry getting it from /api/dashboard if we add it there, or just assume we need to update api/vendor/settings to include status.
            }

            // For now, I will fetch settings to get admin link
            const resSettings = await fetch("/api/admin/settings") // This might be admin only...
            // Wait, /api/admin/settings is protected for ADMIN.
            // I need a public or vendor-accessible endpoint to get the "Registration Fee Info".
            // Let's create/update an endpoint for this.
        } catch (error) {
            console.error(error)
        }
    }

    // ... rest of component
    return <div>...</div>
}
