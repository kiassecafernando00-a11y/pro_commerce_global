"use client"

import { Upload, X, Loader2 } from "lucide-react"
import { useState } from "react"

interface ImageUploadInputProps {
    name: string
    defaultValue?: string
    placeholder?: string
    label?: string
}

export function ImageUploadInput({ name, defaultValue = "", placeholder = "https://...", label = "Imagem" }: ImageUploadInputProps) {
    const [url, setUrl] = useState(defaultValue)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            setUrl(data.url)
        } catch (error) {
            console.error(error)
            alert("Erro ao fazer upload da imagem.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase flex justify-between">
                {label}
                {url && <span className="text-green-600 font-normal normal-case">Imagem carregada!</span>}
            </label>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        name={name}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full p-2 pl-9 border rounded-lg bg-gray-50 text-sm font-medium text-gray-700"
                        placeholder={placeholder}
                        required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4" />}
                    </div>
                </div>

                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center justify-center transition-colors shadow-sm min-w-[40px]">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
            </div>

            {url && (
                <div className="mt-2 relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => setUrl("")}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
