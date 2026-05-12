
import { prisma } from "@/lib/prisma"
import { Users, Store as StoreIcon, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { toggleUserStatus, approveStore, rejectStore, suspendStore, reactivateStore, deleteStore, deleteUser } from "./actions"
import DeleteConfirmer from "@/components/DeleteConfirmer"

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: { store: true }
    })

    const stores = await prisma.store.findMany({
        orderBy: { createdAt: 'desc' },
        include: { user: true }
    })

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-8 h-8 text-blue-600" />
                Gestão de Utilizadores & Lojas
            </h1>

            {/* Split View */}
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">

                {/* STORES SECTION (Priority) */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <StoreIcon className="w-5 h-5 text-purple-600" />
                            <h2 className="text-lg font-bold text-gray-800">Lojas & Vendedores</h2>
                        </div>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                            {stores.length} Registadas
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-white border-b">
                                <tr>
                                    <th className="px-6 py-3">Loja</th>
                                    <th className="px-6 py-3">Vendedor</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stores.map(store => (
                                    <tr key={store.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {store.name}
                                            <p className="text-xs text-gray-400 font-normal">{new Date(store.createdAt).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{store.user.name}</span>
                                                <span className="text-xs text-gray-500">{store.user.email}</span>
                                                {/* Seller Details */}
                                                {(store.user as any).nif && (
                                                    <span className="text-[10px] text-gray-400 mt-1">NIF: {(store.user as any).nif}</span>
                                                )}
                                                {(store.user as any).phone && (
                                                    <span className="text-[10px] text-gray-400">Tel: {(store.user as any).phone}</span>
                                                )}
                                                {(store.user as any).idDocumentImage && (
                                                    <a href={(store.user as any).idDocumentImage} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-500 hover:underline mt-1 flex items-center gap-1">
                                                        📄 Documento de Identidade
                                                    </a>
                                                )}

                                                {/* Fee Proof Link */}
                                                {(store as any).registrationFeeProof && (
                                                    <a href={(store as any).registrationFeeProof} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline mt-1 font-bold">
                                                        Ver Comprovativo
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={store.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <form className="inline-flex gap-2 items-center justify-end w-full">
                                                {/* PENDING ACTIONS */}
                                                {store.status === "PENDING" && (
                                                    <>
                                                        <button formAction={async () => { "use server"; await approveStore(store.id) }} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Aprovar">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button formAction={async () => { "use server"; await rejectStore(store.id) }} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Rejeitar">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                {/* APPROVED ACTIONS */}
                                                {store.status === "APPROVED" && (
                                                    <button formAction={async () => { "use server"; await suspendStore(store.id) }} className="p-1.5 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200" title="Suspender / Banir">
                                                        <ShieldAlert className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* REJECTED / BANNED ACTIONS */}
                                                {(store.status === "REJECTED" || store.status === "BANNED") && (
                                                    <button formAction={async () => { "use server"; await reactivateStore(store.id) }} className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" title="Reativar Loja">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}

                                                {/* ALWAYS ALLOW DELETE */}
                                                <DeleteConfirmer
                                                    onDelete={async () => { "use server"; await deleteStore(store.id) }}
                                                    message="Tem certeza que deseja apagar esta loja e TODOS os seus produtos?"
                                                    title="Apagar Loja Permanentemente"
                                                />
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {stores.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma loja encontrada.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* USERS SECTION */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-800">Todos os Utilizadores</h2>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                            {users.length} Total
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-400 uppercase bg-white border-b">
                                <tr>
                                    <th className="px-6 py-3">Utilizador</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {user.name || "Sem Nome"}
                                            <p className="text-xs text-gray-400 font-normal">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-black text-white' : user.role === 'VENDOR' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.isActive ?
                                                <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><ShieldCheck className="w-3 h-3" /> Ativo</span> :
                                                <span className="text-red-500 flex items-center gap-1 text-xs font-bold"><ShieldAlert className="w-3 h-3" /> Suspenso</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user.role !== 'ADMIN' && (
                                                <form className="inline-flex items-center gap-3 justify-end w-full">
                                                    <button formAction={async () => { "use server"; await toggleUserStatus(user.id, user.isActive) }} className={`text-xs font-bold hover:underline ${user.isActive ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {user.isActive ? "Suspender" : "Reativar"}
                                                    </button>

                                                    <DeleteConfirmer
                                                        onDelete={async () => { "use server"; await deleteUser(user.id) }}
                                                        message="Tem certeza que deseja apagar este utilizador permanentemente?"
                                                        title="Apagar Utilizador"
                                                    />
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
        BANNED: "bg-gray-800 text-white"
    }
    return (
        <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    )
}
