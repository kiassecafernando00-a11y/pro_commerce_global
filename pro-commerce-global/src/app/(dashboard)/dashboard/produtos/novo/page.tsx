"use client"

import ProductForm from "@/components/products/ProductForm"
import { useRouter } from "next/navigation"

export default function NewProductPage() {
    const router = useRouter()

    async function handleSubmit(data: any) {
        const response = await fetch("/api/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorRaw = await response.text();
            let errorMessage = errorRaw;
            try {
                const errorJson = JSON.parse(errorRaw);
                if (errorJson.details) {
                    errorMessage = `Erro: ${errorJson.details}`;
                    if (errorJson.code === 'P2002') errorMessage = "Erro: Já existe um produto com este SKU ou nome.";
                }
            } catch (e) {
                // Not JSON, use text
            }
            throw new Error(errorMessage || "Falha ao criar produto")
        }

        router.push("/dashboard/produtos")
        router.refresh()
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Produto</h1>
                <p className="text-gray-600">Adicione um novo item ao seu catálogo.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <ProductForm onSubmit={handleSubmit} />
            </div>
        </div>
    )
}
