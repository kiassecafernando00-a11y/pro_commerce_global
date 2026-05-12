"use client"

import { DEPARTMENTS } from "@/data/categories"
import { LayoutGrid } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function CategoriesPage() {
    const { t } = useLanguage()

    // Use the shared static list as the source of truth for now
    const categories = DEPARTMENTS.map(d => ({
        id: d.id,
        name: t(`cat_${d.id.replace(/-/g, '_')}`) || d.label,
        slug: d.slug,
        image: d.image,
        description: null // Static list doesn't have descriptions yet
    }))

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Todas as Categorias</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Explore a nossa vasta seleção de produtos organizados para si.
                </p>
            </div>

            {categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/produtos?cat=${category.slug}`}
                            className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                        >
                            <div className="w-24 h-24 mb-4 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm border border-gray-100">
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <LayoutGrid className="w-8 h-8 text-blue-300" />
                                )}
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">{category.name}</h3>
                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Ver Produtos</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-gray-500">Nenhuma categoria encontrada no momento.</p>
                </div>
            )}
        </div>
    )
}
