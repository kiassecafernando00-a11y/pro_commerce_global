import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

import ProductView from "@/components/products/ProductView"
import ProductReviews from "@/components/products/ProductReviews"
import BackToStoreLink from "@/components/products/BackToStoreLink"
import Link from "next/link"

export default async function ProductDetailsPage(
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const product = await prisma.product.findUnique({
        where: { id: params.id },
        include: {
            store: true
        }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50">


            <div className="container mx-auto px-6 py-8">
                <BackToStoreLink />

                <ProductView product={product as any} />

                <ProductReviews productId={product.id} />
            </div>

            <footer className="bg-brand-dark text-gray-300 py-8 px-6 border-t border-white/10 mt-16">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 ProCommerceGlobal. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    )
}
