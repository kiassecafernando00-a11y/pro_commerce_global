import { prisma } from "@/lib/prisma"

import Footer from "@/components/Footer"

export const dynamic = 'force-dynamic'

export default async function TermsPage() {
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } })
    const content = config?.policyTerms || "Termos e Condições ainda não definidos pelo administrador."

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Termos e Condições</h1>
                    <div className="prose prose-slate max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {content}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
