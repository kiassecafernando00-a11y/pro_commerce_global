import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        // Lógica personalizada de autorização se necessário
        const token = req.nextauth.token
        const isVendorRoute = req.nextUrl.pathname.startsWith("/vendor")
        const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

        if (isVendorRoute && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        if (isAdminRoute && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/vendor/:path*", "/admin/:path*"],
}
