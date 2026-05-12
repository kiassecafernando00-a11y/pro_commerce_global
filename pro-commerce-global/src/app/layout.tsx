import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProCommerceGlobal | O Mercado de Angola para o Mundo",
    template: "%s | ProCommerceGlobal"
  },
  description: "A plataforma líder de e-commerce em Angola. Compre e venda produtos globais com facilidade, segurança e rapidez.",
  keywords: ["ecommerce", "angola", "compras online", "marketplace", "vendas"],
  authors: [{ name: "ProCommerce Team" }],
  creator: "ProCommerceGlobal",
  openGraph: {
    type: "website",
    locale: "pt_AO",
    url: "https://procommerce-global.com",
    title: "ProCommerceGlobal | O Mercado de Angola",
    description: "A porta angolana para o mercado global.",
    siteName: "ProCommerceGlobal",
    images: [
      {
        url: "/og-image.jpg", // We should ideally utilize generate_image to create this if it doesn't exist
        width: 1200,
        height: 630,
        alt: "ProCommerceGlobal Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProCommerceGlobal",
    description: "O maior marketplace de Angola.",
    creator: "@procommerceao",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

import { prisma } from "@/lib/prisma";
import { LayoutWrapper } from "@/components/LayoutWrapper";

import { DEPARTMENTS } from "@/data/categories"

// Data Fetching for Layout
async function getLayoutData() {
  const [config] = await Promise.all([
    prisma.systemConfig.findUnique({ where: { id: "global" } })
  ])

  // Use static departments for the Header to ensure it matches the user's requested list
  const categories = DEPARTMENTS.map(d => ({
    id: d.id,
    name: d.label,
    slug: d.slug,
    image: d.image // Now using real image URL
  }))

  // Universal serialization to fix "Decimal" and "Date" object errors in Client Components
  return JSON.parse(JSON.stringify({ config, categories }))
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { config, categories } = await getLayoutData()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased text-slate-900 bg-slate-50`}
      >
        <Providers>
          <CartDrawer />
          <Toaster position="top-center" />

          <LayoutWrapper
            header={<Header systemConfig={config} categories={categories} />}
            footer={<Footer />}
          >
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
// Forced rebuild
