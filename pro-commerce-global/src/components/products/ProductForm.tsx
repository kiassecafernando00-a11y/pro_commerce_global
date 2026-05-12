"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DEPARTMENTS } from "@/data/categories"

interface ProductFormData {
    name: string
    description: string
    price: string
    salePrice?: string
    stock: string
    images: string
    category: string
    categoryId?: string
    sku?: string
    tags?: string
    isVisible: boolean
}

interface ProductFormProps {
    initialData?: ProductFormData
    onSubmit: (data: ProductFormData) => Promise<void>
    isEditing?: boolean
}

export default function ProductForm({ initialData, onSubmit, isEditing = false }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState<ProductFormData>(
        initialData || {
            name: "",
            description: "",
            price: "",
            salePrice: "",
            stock: "",
            images: "",
            category: "Outros",
            categoryId: "",
            sku: "",
            tags: "",
            isVisible: true
        }
    )



    const [categories, setCategories] = useState<{ id: string, name: string }[]>(
        DEPARTMENTS.map(d => ({ id: d.slug, name: d.label }))
    )
    const [isCustomCategory, setIsCustomCategory] = useState(false)

    useEffect(() => {
        // Set default category if not set
        if (!isEditing && !formData.categoryId && categories.length > 0) {
            setFormData(prev => ({
                ...prev,
                category: categories[0].name,
                categoryId: categories[0].id
            }))
        }
    }, [])

    // ... (drag handlers unchanged) ...

    const [isDragging, setIsDragging] = useState(false)

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            processFile(file)
        }
    }

    async function processFile(file: File) {
        if (!file.type.startsWith("image/")) {
            alert("Por favor selecione uma imagem.")
            return
        }

        setUploading(true)
        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setFormData(prev => ({ ...prev, images: data.url }))
        } catch (error) {
            console.error("Upload error:", error)
            alert("Erro ao fazer upload da imagem.")
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            await onSubmit(formData)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            Informações Básicas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                    placeholder="Ex: Tênis Nike Air Force 1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                    {!isCustomCategory ? (
                                        <div className="flex gap-2">
                                            <select
                                                required={!isCustomCategory}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all bg-white"
                                                value={formData.categoryId || ""}
                                                onChange={(e) => {
                                                    const selectedId = e.target.value
                                                    if (selectedId === 'new') {
                                                        setIsCustomCategory(true)
                                                        setFormData({ ...formData, categoryId: undefined, category: "" })
                                                    } else {
                                                        const selectedCat = categories.find(c => c.id === selectedId)
                                                        if (selectedCat) {
                                                            setFormData({ ...formData, categoryId: selectedCat.id, category: selectedCat.name })
                                                        }
                                                    }
                                                }}
                                            >
                                                <option value="" disabled>Selecione...</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                                <option value="new" className="font-bold text-blue-600">+ Nova Categoria</option>
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                                                placeholder="Digite o nome da nova categoria..."
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value, categoryId: undefined })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomCategory(false)}
                                                className="px-3 py-2 text-sm text-gray-500 hover:text-red-500 bg-gray-100 rounded-lg"
                                                title="Cancelar"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Referência)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                            placeholder="Ex: NIKE-AF1-001"
                                            value={formData.sku || ""}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
                                                const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : "PROD";
                                                const newSku = `${prefix}-${randomSuffix}`;
                                                setFormData({ ...formData, sku: newSku });
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-gold"
                                            title="Gerar SKU Automático"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Separadas por vírgula)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                    placeholder="Ex: Tênis, Nike, Masculino"
                                    value={formData.tags || ""}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all resize-none"
                                    placeholder="Descreva seu produto..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            Preço e Estoque
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Atual (AOA)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">Kz</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-400">Kz</span>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                        placeholder="Opcional"
                                        value={formData.salePrice || ""}
                                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-all"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>
                        </div>
                        {formData.salePrice && Number(formData.salePrice) < Number(formData.price) && (
                            <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg flex items-center gap-2">
                                <span className="font-bold">%{Math.round((1 - Number(formData.salePrice) / Number(formData.price)) * 100)} OFF</span>
                                <span>Este produto aparecerá em destaque como promoção.</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Media & Status */}
                <div className="space-y-6">
                    {/* Media Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mídia</h2>

                        <div
                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all text-center cursor-pointer ${isDragging ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200 hover:border-brand-gold hover:bg-gray-50'}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {formData.images ? (
                                <div className="space-y-4">
                                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-gray-100 shadow-inner group">
                                        <img src={formData.images} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, images: "" }) }}
                                                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">Imagem Principal</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Clique ou Arraste</p>
                                    <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 5MB)</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        id="file-upload"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
                                </>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10 backdrop-blur-sm">
                                    <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Visibilidade</h2>
                        <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${formData.isVisible ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200'}`}>
                            <div className="flex flex-col">
                                <span className={`text-sm font-medium ${formData.isVisible ? 'text-blue-700' : 'text-gray-900'}`}>
                                    {formData.isVisible ? "Publicado" : "Oculto"}
                                </span>
                                <span className={`text-xs ${formData.isVisible ? 'text-blue-500' : 'text-gray-500'}`}>
                                    {formData.isVisible ? "Visível na loja" : "Apenas você vê"}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isVisible: !formData.isVisible })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.isVisible ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isVisible ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/40 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                "Salvar Produto"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}
