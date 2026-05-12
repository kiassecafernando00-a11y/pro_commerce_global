"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

export default function FeePaymentPage() {
    const [config, setConfig] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Fetch system config and store status
        fetch("/api/store/status")
            .then(res => res.json())
            .then(data => {
                setConfig(data)
                if (data.store?.registrationFeeStatus === 'PAID') {
                    router.push('/dashboard')
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [router])

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setUploading(true)
        try {
            // 1. Upload File
            const formData = new FormData()
            formData.append("file", file)

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })
            const uploadData = await uploadRes.json()

            if (!uploadRes.ok) throw new Error("Falha no upload")

            // 2. Submit Proof
            const submitRes = await fetch("/api/store/submit-fee", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ proofUrl: uploadData.url })
            })

            if (submitRes.ok) {
                setSuccess(true)
            }
        } catch (error) {
            alert("Erro ao enviar comprovativo. Tente novamente.")
        } finally {
            setUploading(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Comprovativo Enviado!</h2>
                    <p className="text-gray-500 mb-6">
                        A nossa equipa irá analisar o seu pagamento em breve. Assim que for aprovado, a sua loja será ativada.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Voltar ao Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-light-gradient p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-brand-dark text-white p-8 text-center">
                    <h1 className="text-3xl font-bold text-brand-gold mb-2">Ativação da Loja</h1>
                    <p className="opacity-80">Para começar a vender, é necessário regularizar a taxa de inscrição.</p>
                </div>

                <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">

                        <div className="space-y-6">
                            <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
                                <h3 className="font-bold text-lg mb-4 text-yellow-800 flex items-center gap-2">
                                    dados de Pagamento
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Valor da Taxa</label>
                                        <p className="text-3xl font-black text-gray-900">
                                            {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(config?.fee || 5000)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">IBAN / Conta</label>
                                        <p className="font-mono text-lg bg-white p-3 rounded-lg border border-gray-200 select-all">
                                            {config?.adminPaymentInfo || "Informação de pagamento não configurada. Contacte o suporte."}
                                        </p>
                                    </div>
                                    {config?.adminReference && (
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Referência / Titular</label>
                                            <p className="font-medium">{config.adminReference}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-sm text-gray-500 flex gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
                                <p>Após fazer a transferência, guarde o comprovativo e envie-nos através do formulário ao lado.</p>
                            </div>
                        </div>

                        <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-8">
                            <h3 className="font-bold text-xl mb-6">Enviar Comprovativo</h3>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors relative">
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        required
                                    />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Upload className="w-6 h-6 text-gray-400" />
                                        </div>
                                        {file ? (
                                            <div className="text-green-600 font-bold break-all">
                                                {file.name}
                                            </div>
                                        ) : (
                                            <>
                                                <p className="font-bold text-gray-700">Clique para selecionar</p>
                                                <p className="text-xs text-gray-400">PDF, JPG ou PNG (Máx 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-brand-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading ? "A enviar..." : "Enviar Comprovativo"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
