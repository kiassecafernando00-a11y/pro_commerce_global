"use client"

import ProductForm from "@/components/products/ProductForm"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function EditProductPage() {
    const router = useRouter()
    const params = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`/api/products/${params.id}`)
                if (response.ok) {
                    const data = await response.json()
                    setProduct({
                        ...data,
                        price: data.price.toString(),
                        stock: data.stock.toString(),
                        images: data.images || "",
                    })
                } else {
                    alert("Produto não encontrado")
                    router.push("/dashboard/produtos")
                }
            } catch (error) {
                console.error("Failed to fetch product:", error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchProduct()
        }
    }, [params.id, router])

    async function handleSubmit(data: any) {
        const response = await fetch(`/api/products/${params.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error("Failed to update product")
        }

        router.push("/dashboard/produtos")
        router.refresh()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando produto...</p>
                </div>
            </div>
        )
    }

    if (!product) return null

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Produto</h1>
                <p className="text-gray-600">Atualize as informações do seu produto.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    isEditing={true}
                />
            </div>
        </div>
    )
}
