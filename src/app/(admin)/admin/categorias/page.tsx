import { prisma } from "@/lib/prisma"
import { createCategory, deleteCategory, toggleCategoryStatus } from "./actions"
import { Plus, Trash2, Edit, CheckCircle, XCircle, Search, FolderOpen } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { products: true } } }
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FolderOpen className="w-8 h-8 text-brand-gold" />
                        Gestão de Categorias
                    </h1>
                    <p className="text-gray-500">Organize os produtos da loja em categorias oficiais.</p>
                </div>

                {/* Simple Create Form inline for speed */}
                <div className="w-full md:w-auto">
                    {/* This could be a modal, but for simplicity/speed we can use a summary/details or just a form at the top if requested. 
                 For now, let's just list them and maybe put a creation form in a second column or modal? 
                 Let's stick to a clean list and a "Nova Categoria" section below or above.
             */}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Slug</th>
                                    <th className="px-6 py-3 text-center">Produtos</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {categories.map((cat) => (
                                    <tr key={cat.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-bold text-gray-800">{cat.name}</td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">{cat.slug}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-blue-50 text-blue-600 py-1 px-2 rounded-lg font-bold text-xs">
                                                {cat._count.products}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {cat.isActive ? (
                                                <span className="text-green-500 font-bold text-xs flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> Ativo</span>
                                            ) : (
                                                <span className="text-gray-400 font-bold text-xs flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Inativo</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={async () => {
                                                "use server"
                                                await deleteCategory(cat.id)
                                            }}>
                                                <button className="text-red-400 hover:text-red-600 transition-colors" title="Remover">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-400">
                                            <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                            Nenhuma categoria encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Create Form */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-green-600" />
                            Nova Categoria
                        </h3>
                        <form action={async (formData) => {
                            "use server"
                            await createCategory(formData)
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nome</label>
                                <input name="name" required placeholder="Ex: Eletrónicos" className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-gold/50" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição (Opcional)</label>
                                <textarea name="description" rows={3} placeholder="Breve descrição..." className="w-full p-3 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-brand-gold/50" />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-all">
                                Criar Categoria
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
