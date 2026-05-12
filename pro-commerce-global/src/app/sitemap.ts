import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Static routes
    const routes = [
        '',
        '/shop',
        '/ofertas',
        '/categorias',
        '/auth/login',
        '/auth/register',
        '/info',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Dynamic products
    const products = await prisma.product.findMany({
        where: { status: 'APPROVED' },
        select: { id: true, updatedAt: true },
        take: 1000, // Limit for sitemap
    })

    const productRoutes = products.map((product) => ({
        url: `${baseUrl}/produtos/${product.id}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
    }))

    return [...routes, ...productRoutes]
}
