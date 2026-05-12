"use client"

import { usePathname } from "next/navigation"

interface LayoutWrapperProps {
    children: React.ReactNode
    header: React.ReactNode
    footer: React.ReactNode
}

export function LayoutWrapper({ children, header, footer }: LayoutWrapperProps) {
    const pathname = usePathname()

    // Hide Header/Footer on Admin and Dashboard routes
    // Also hiding on auth pages usually looks cleaner, but user specifically asked for "reserved areas". 
    // Usually "reserved" implies where they work (admin/dashboard).
    const isReservedPage = pathname?.startsWith("/admin")
        || pathname?.startsWith("/dashboard")

    return (
        <div className="flex flex-col min-h-screen">
            {!isReservedPage && header}

            <main className="flex-grow">
                {children}
            </main>

            {!isReservedPage && (
                <div className="mt-20">
                    {footer}
                </div>
            )}
        </div>
    )
}
