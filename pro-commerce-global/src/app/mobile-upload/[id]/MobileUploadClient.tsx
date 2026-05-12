"use client"

import { useState } from "react"
import { Camera, CheckCircle, Smartphone, Upload, ArrowUp, Loader2 } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

export default function MobileUploadClient({ sessionId }: { sessionId: string }) {
    const [frontFile, setFrontFile] = useState<File | null>(null)
    const [backFile, setBackFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isBack: boolean) => {
        if (e.target.files && e.target.files[0]) {
            if (isBack) setBackFile(e.target.files[0])
            else setFrontFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!frontFile || !backFile) {
            toast.error("Por favor, tire as duas fotos (Frente e Verso).")
            return
        }

        setUploading(true)
        const formData = new FormData()
        formData.append("sessionId", sessionId)
        formData.append("frontImage", frontFile)
        formData.append("backImage", backFile)

        try {
            const res = await fetch("/api/mobile-upload", {
                method: "POST",
                body: formData
            })

            if (!res.ok) throw new Error("Erro no envio")

            setSuccess(true)
        } catch (error) {
            toast.error("Erro ao enviar fotos. Tente novamente.")
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

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
                <h1 className="text-2xl font-bold">Faça o upload dos documentos</h1>
                <p className="text-slate-400 text-sm mt-1">Use a câmera para fotografar seu documento.</p>
                <p className="text-xs text-slate-500 mt-2">ID: {sessionId}</p>
            </div>

            <div className="flex-1 space-y-6">

                {/* Front */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Frente do Documento</label>
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

                {/* Back */}
                <div className="space-y-2">
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

            </div>

            <button
                onClick={handleSubmit}
                disabled={uploading || !frontFile || !backFile}
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
