"use client"

import { useState, useEffect, use } from "react"
import { Camera, CheckCircle, Smartphone, Upload, ArrowUp, Loader2 } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

export default function MobileUploadPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [frontFile, setFrontFile] = useState<File | null>(null)
    const [backFile, setBackFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [documentType, setDocumentType] = useState<string>("BI") // Default to BI
    const [loading, setLoading] = useState(true)

    // Check session type on load
    useEffect(() => {
        if (!id) return;

        fetch(`/api/mobile-upload?id=${id}`)
            .then(res => res.json())
            .then(data => {
                console.log("Session Data:", data)
                if (data.success) {
                    setDocumentType(data.documentType || "BI")
                }
                setLoading(false)
            })
            .catch((e) => {
                console.error(e)
                setLoading(false)
            })
    }, [id])

    const isPassport = documentType === "PASSPORT"

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBack: boolean) => {
        if (e.target.files && e.target.files[0]) {
            if (isBack) setBackFile(e.target.files[0])
            else setFrontFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!frontFile) {
            toast.error("Por favor, tire a foto da Frente do documento.")
            return
        }

        if (!isPassport && !backFile) {
            toast.error("Por favor, tire a foto do Verso do documento.")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("sessionId", id)
        formData.append("frontImage", frontFile)
        if (backFile) formData.append("backImage", backFile)

        try {
            const res = await fetch("/api/mobile-upload", {
                method: "POST",
                body: formData
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || "Erro ao conectar com o servidor")

            setSuccess(true)
        } catch (error: any) {
            console.error("Upload Error:", error)
            toast.error(`Erro: ${error.message || "Falha no envio"}`)
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8" /></div>

    if (success) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-green-800 mb-2">Sucesso!</h1>
                <p className="text-green-700">As fotos foram enviadas para o seu computador. Pode continuar o cadastro lá.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col">
            <Toaster position="top-center" />

            <div className="mb-8 pt-4">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                    <Smartphone className="w-5 h-5" />
                    <span className="font-bold tracking-wide text-xs uppercase">ProCommerce Magic Upload</span>
                </div>
                <h1 className="text-2xl font-bold">Upload de {isPassport ? "Passaporte" : "Documento"}</h1>
                <p className="text-slate-400 text-sm mt-1">
                    {isPassport ? "Envie apenas a página de dados pessoais." : "Envie frente e verso do documento."}
                </p>
                <div className="mt-2 flex flex-col items-center gap-1">
                    <div className="flex gap-2 justify-center">
                        <span className="inline-block px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-500 font-mono">
                            ID: {id?.substring(0, 6)}...
                        </span>
                        <span className="inline-block px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-[10px] font-bold uppercase border border-blue-900">
                            TYPE: {documentType}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6">

                {/* Front */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                        {isPassport ? "Página Principal (Foto/Dados)" : "Frente do Documento"}
                    </label>
                    <label className={`block w-full aspect-[3/2] border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${frontFile ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800 hover:bg-slate-750"
                        }`}>
                        {frontFile ? (
                            <>
                                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                <span className="text-xs text-green-400 font-medium">Foto Capturada</span>
                                <span className="text-[10px] text-green-500/70 absolute bottom-2">{frontFile.name}</span>
                            </>
                        ) : (
                            <>
                                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-400">Toque para Fotografar</span>
                            </>
                        )}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, false)} />
                    </label>
                </div>

                {/* Back (Hide if Passport) */}
                {!isPassport && (
                    <div className="space-y-2 animate-in slide-in-from-bottom-4">
                        <label className="text-sm font-medium text-slate-300">Verso do Documento</label>
                        <label className={`block w-full aspect-[3/2] border-2 border-dashed rounded-xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${backFile ? "border-green-500 bg-green-500/10" : "border-slate-700 bg-slate-800 hover:bg-slate-750"
                            }`}>
                            {backFile ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                                    <span className="text-xs text-green-400 font-medium">Foto Capturada</span>
                                    <span className="text-[10px] text-green-500/70 absolute bottom-2">{backFile.name}</span>
                                </>
                            ) : (
                                <>
                                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                                    <span className="text-xs text-slate-400">Toque para Fotografar</span>
                                </>
                            )}
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange(e, true)} />
                        </label>
                    </div>
                )}

            </div>

            <button
                onClick={handleSubmit}
                disabled={uploading || !frontFile || (!isPassport && !backFile)}
                className="w-full mt-8 bg-amber-500 text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        Enviar para o Computador
                    </>
                )}
            </button>
        </div>
    )
}
