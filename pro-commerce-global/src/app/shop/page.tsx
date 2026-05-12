import { Building2, MapPin } from "lucide-react"

export default function ShopPage() {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Lojas Oficiais</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Descubra as melhore marcas e vendedores da ProCommerce Global. Qualidade garantida e entrega rápida.
                </p>
            </div>

            {/* Placeholder for Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center pt-8">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400">
                    <Building2 className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">O catálogo de lojas está a ser atualizado.</p>
                    <p className="text-sm mt-2 text-gray-400">Novidades em breve!</p>
                </div>
            </div>
        </div>
    )
}
