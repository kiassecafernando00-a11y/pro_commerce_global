
"use client"

import { updateGatewayConfig } from "../actions"
import { Lock, Eye, EyeOff, Save, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" disabled={pending} className="w-full bg-slate-800 text-white font-bold py-2 rounded-lg hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
            {pending ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Configuração</>}
        </button>
    )
}

export function GatewayManager({ provider, title, config }: { provider: string, title: string, config: any }) {
    const [showSecrets, setShowSecrets] = useState(false)

    return (
        <form action={async (formData) => {
            await updateGatewayConfig(provider, formData)
            alert("Configuração salva com sucesso!")
        }} className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-700 font-mono">{title}</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" className="sr-only peer" defaultChecked={config?.isActive} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Public API Key</label>
                <input
                    name="publicKey"
                    defaultValue={config?.publicKey || ""}
                    type="text"
                    placeholder={`pk_test_...`}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono"
                />
            </div>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <label className="text-xs font-bold text-gray-500 uppercase">Secret Key</label>
                    <button type="button" onClick={() => setShowSecrets(!showSecrets)} className="text-xs text-blue-600 flex items-center gap-1">
                        {showSecrets ? <><EyeOff className="w-3 h-3" /> Ocultar</> : <><Eye className="w-3 h-3" /> Mostrar</>}
                    </button>
                </div>
                <div className="relative">
                    <input
                        name="secretKey"
                        defaultValue={config?.secretKey || ""}
                        type={showSecrets ? "text" : "password"}
                        placeholder={`sk_live_...`}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-mono pr-10"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                </div>
            </div>

            <SubmitButton />
        </form>
    )
}
