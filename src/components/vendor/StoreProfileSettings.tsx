"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Upload, ImageIcon, Store as StoreIcon, Phone, MapPin } from "lucide-react"

interface Store {
    name: string
    description: string | null
    logo: string | null
    banner: string | null
    address: string | null
    phone: string | null
}

interface StoreProfileSettingsProps {
    initialData: Store
}

export default function StoreProfileSettings({ initialData }: StoreProfileSettingsProps) {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        description: initialData.description || "",
        logo: initialData.logo || "",
        banner: initialData.banner || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
    })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast.error("Por favor selecione uma imagem válida (JPG, PNG).")
            return
        }

        setUploading(true)
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: uploadFormData,
            })

            if (!response.ok) throw new Error("Upload failed")

            const data = await response.json()
            setFormData(prev => ({ ...prev, [field]: data.url }))
            toast.success("Imagem carregada!")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Erro ao fazer upload da imagem.")
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        try {
            const response = await fetch("/api/store", {
                method: "PATCH", // Always PATCH since store exists if we are here
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                toast.success("Perfil atualizado com sucesso!")
                router.refresh()
            } else {
                throw new Error("Failed to save")
            }
        } catch (error) {
            console.error("Error saving store:", error)
            toast.error("Erro ao salvar alterações.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Identidade Visual & Sobre</h2>
                <p className="text-slate-500 text-sm">Personalize como sua loja aparece para os clientes.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8 shadow-sm">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Text Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Loja</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-400">
                                    <StoreIcon className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors font-medium"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Boutique Elegance"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Descrição</label>
                            <textarea
                                rows={5}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors resize-none font-medium text-slate-600 leading-relaxed"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva sua loja, sua história e o que você vende..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Contacto Telefónico</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-400">
                                    <Phone className="w-5 h-5" />
                                </span>
                                <input
                                    type="tel"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors font-medium"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+244 9XX XXX XXX"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Endereço Visível</label>
                            <div className="relative">
                                <span className="absolute left-4 top-3 text-slate-400">
                                    <MapPin className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-100 focus:border-brand-gold focus:outline-none transition-colors font-medium"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Rua, Bairro, Cidade..."
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-2 ml-1">Este endereço será exibido no perfil da loja.</p>
                        </div>
                    </div>

                    {/* Right Column: Images */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Logótipo</label>
                            <div className="flex gap-6 items-start">
                                <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative shadow-sm group">
                                    {formData.logo ? (
                                        <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <StoreIcon className="w-10 h-10 text-slate-300" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-brand-gold transition-colors">
                                            <Upload className="w-8 h-8 mb-2" />
                                            <p className="text-sm font-bold">Carregar Logo</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg"
                                            onChange={(e) => handleFileUpload(e, 'logo')}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Banner da Loja</label>
                            <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group">
                                {formData.banner ? (
                                    <>
                                        <img src={formData.banner} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <div className="relative z-10 flex flex-col items-center justify-center">
                                            <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-sm">Alterar Banner</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-400 group-hover:text-brand-gold transition-colors">
                                        <ImageIcon className="w-10 h-10 mb-2" />
                                        <p className="text-sm font-bold">Carregar Banner</p>
                                        <p className="text-xs text-slate-400 mt-1">Recomendado: 1200x400px</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                    onChange={(e) => handleFileUpload(e, 'banner')}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-4 bg-brand-gold text-brand-dark font-black rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-70 shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2 text-lg"
                >
                    {saving ? "Salvando..." : "Salvar Alterações"}
                </button>
            </div>
        </form>
    )
}
