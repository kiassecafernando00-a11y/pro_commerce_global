
import { prisma } from "@/lib/prisma"
import { CheckCircle, XCircle, Trash2, ShoppingBag, Eye } from "lucide-react"
import { approveProduct, rejectProduct, deleteProduct } from "./actions"
import DeleteConfirmer from "@/components/DeleteConfirmer"

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { store: true }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
                Catálogo Global de Produtos
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700">Todos os Produtos ({products.length})</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white border-b">
                            <tr>
                                <th className="px-6 py-3">Produto</th>
                                <th className="px-6 py-3">Preço</th>
                                <th className="px-6 py-3">Loja</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(product => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-500">{product.category} • {product.stock} em stock</div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: product.currency || 'AOA' }).format(Number(product.price))}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {product.store.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                            ${product.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                product.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    product.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {product.status || "APPROVED"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <form className="flex items-center justify-end gap-2">
                                            {product.status === "PENDING" && (
                                                <>
                                                    <button
                                                        formAction={async () => { "use server"; await approveProduct(product.id) }}
                                                        className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                        title="Aprovar"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        formAction={async () => { "use server"; await rejectProduct(product.id) }}
                                                        className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                        title="Rejeitar"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            {product.status === "APPROVED" && (
                                                <button
                                                    formAction={async () => { "use server"; await rejectProduct(product.id) }}
                                                    className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-red-100 hover:text-red-600"
                                                    title="Remover Aprovação / Rejeitar"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            <DeleteConfirmer
                                                onDelete={async () => { "use server"; await deleteProduct(product.id) }}
                                                message="Tem certeza que deseja apagar este produto?"
                                                title="Apagar Produto Permanentemente"
                                            />
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
