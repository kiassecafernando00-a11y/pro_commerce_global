"use client"

import { useState } from "react"
import { Mail, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export function NewsletterForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        // Simulate API call or call a server action
        await new Promise(resolve => setTimeout(resolve, 1000))

        toast.success("Inscrito com sucesso!")
        setEmail("")
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="flex w-full md:w-auto gap-2">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                required
                className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-brand-gold w-full md:w-80"
            />
            <button
                type="submit"
                disabled={loading}
                className="bg-brand-gold text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar"}
            </button>
        </form>
    )
}
