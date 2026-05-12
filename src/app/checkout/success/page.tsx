"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [verifying, setVerifying] = useState(true)
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        // Simulate verification (in reality, order is created via webhook)
        const timer = setTimeout(() => {
            setVerifying(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (!sessionId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Sessão Inválida</h1>
                    <p className="text-gray-600 mb-6">
                        Não foi possível verificar o pagamento.
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar à Página Inicial
                    </Link>
                </div>
            </div>
        )
    }

    if (verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Verificando Pagamento...</h1>
                    <p className="text-gray-600">
                        Aguarde enquanto confirmamos sua compra.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 text-center mb-3">
                    Pagamento Confirmado!
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Seu pedido foi processado com sucesso e está sendo preparado.
                </p>

                {/* Order Info */}
                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        <Package className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-bold text-gray-700">Próximos Passos:</p>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600 pl-2">
                        <li>✅ Pagamento processado via Stripe</li>
                        <li>📧 Receberá confirmação por email</li>
                        <li>📦 Pedido em preparação</li>
                        <li>🚚 Acompanhe o rastreio em "Minhas Compras"</li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/minhas-compras"
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Ver Meus Pedidos
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/"
                        className="w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center block"
                    >
                        Continuar Comprando
                    </Link>
                </div>

                {/* Note */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Referência de Sessão: <span className="font-mono">{sessionId.slice(-8)}</span>
                </p>
            </div>
        </div>
    )
}
