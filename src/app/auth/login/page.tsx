"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { t } = useLanguage()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError(t('common_error')) // Or specific auth error
            } else {
                router.push("/")
                router.refresh()
            }
        } catch (err) {
            setError(t('common_error'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-light-gradient flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 animate-pulse-slow delay-1000"></div>

            <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block text-2xl font-bold tracking-wide text-brand-dark mb-6">
                        Pro<span className="text-brand-gold">Commerce</span>Global
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {t('auth_login_title')}
                    </h1>
                    <p className="text-gray-500">{t('auth_login_desc')}</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('auth_email')}
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            {t('auth_password')}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-gold text-brand-dark font-bold py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg hover:shadow-brand-gold/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? t('common_loading') : t('btn_login')}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    {t('auth_no_account_hint')} <Link href="/auth/register" className="text-brand-gold font-bold hover:underline">{t('auth_register_link')}</Link>
                </div>
            </div>
        </div>
    )
}
