"use client"

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function CheckoutCancelledPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                {/* Cancel Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-gray-900 text-center mb-3">
                    Pagamento Cancelado
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Você cancelou o processo de pagamento. Seus itens ainda estão no carrinho.
                </p>

                {/* Info Box */}
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6">
                    <p className="text-sm text-orange-800 mb-2">
                        <strong>O que aconteceu?</strong>
                    </p>
                    <p className="text-sm text-orange-700">
                        O pagamento não foi concluído. Nenhuma cobrança foi realizada.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/checkout"
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Tentar Novamente
                    </Link>
                    <Link
                        href="/"
                        className="w-full py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center block flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar à Loja
                    </Link>
                </div>

                {/* Help */}
                <p className="text-xs text-gray-500 text-center mt-6">
                    Precisa de ajuda? <Link href="/contato" className="text-blue-600 underline">Entre em contato</Link>
                </p>
            </div>
        </div>
    )
}
