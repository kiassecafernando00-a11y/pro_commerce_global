import { Tag, Clock } from "lucide-react"

export default function OffersPage() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Ofertas do Dia</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    As melhores oportunidades com descontos imperdíveis. Corra antes que acabe!
                </p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-white rounded-3xl border border-blue-100">
                <div className="bg-red-100 text-red-600 w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Tag className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Novas Ofertas a Caminho!</h2>
                <p className="text-gray-500 max-w-md text-center mb-8">
                    Estamos a preparar uma seleção especial de produtos com preços incríveis para si. Fique atento.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>Atualização em breve</span>
                </div>
            </div>
        </div>
    )
}
