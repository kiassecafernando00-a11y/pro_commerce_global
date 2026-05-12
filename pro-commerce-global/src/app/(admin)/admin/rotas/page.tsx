"use client"

import { useState, useEffect } from "react"
import { getRoutes, createRoute, updateRoute, deleteRoute } from "@/app/actions/admin/routes"
import { Plus, Trash2, Edit2, Check, X, Plane, Save, Loader2 } from "lucide-react"

interface Route {
    id: string
    countryName: string
    countryCode: string
    carrier: string
    baseDays: number
    maxDays: number
    isActive: boolean
}

export default function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Form States
    const [formData, setFormData] = useState<Partial<Route>>({
        countryName: "",
        countryCode: "",
        carrier: "ProCommerce Logistics",
        baseDays: 3,
        maxDays: 7,
        isActive: true
    })

    useEffect(() => {
        loadRoutes()
    }, [])

    async function loadRoutes() {
        setLoading(true)
        const res = await getRoutes()
        if (res.success && res.routes) {
            setRoutes(res.routes)
        }
        setLoading(false)
    }

    async function handleSave() {
        if (!formData.countryName || !formData.countryCode) return

        const payload = {
            countryName: formData.countryName,
            countryCode: formData.countryCode.toUpperCase(),
            carrier: formData.carrier || "ProCommerce Logistics",
            baseDays: Number(formData.baseDays),
            maxDays: Number(formData.maxDays)
        }

        if (editingId) {
            await updateRoute(editingId, payload)
        } else {
            await createRoute(payload as any)
        }

        setIsAdding(false)
        setEditingId(null)
        setFormData({
            countryName: "",
            countryCode: "",
            carrier: "ProCommerce Logistics",
            baseDays: 3,
            maxDays: 7,
            isActive: true
        })
        loadRoutes()
    }

    async function handleDelete(id: string) {
        if (confirm("Tem certeza que deseja apagar esta rota?")) {
            await deleteRoute(id)
            loadRoutes()
        }
    }

    function startEdit(route: Route) {
        setEditingId(route.id)
        setFormData({ ...route })
        setIsAdding(true)
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rotas de Entrega</h1>
                    <p className="text-gray-500">Gerir rotas, prazos e transportadoras por país.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null)
                        setFormData({
                            countryName: "",
                            countryCode: "",
                            carrier: "ProCommerce Logistics",
                            baseDays: 3,
                            maxDays: 7,
                            isActive: true
                        })
                        setIsAdding(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" /> Nova Rota
                </button>
            </div>

            {/* Form Modal/Card */}
            {isAdding && (
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-fade-in-down">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">{editingId ? "Editar Rota" : "Nova Rota de Entrega"}</h3>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                            <input
                                type="text"
                                placeholder="Ex: Angola"
                                value={formData.countryName}
                                onChange={e => setFormData({ ...formData, countryName: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Código (ISO)</label>
                            <input
                                type="text"
                                placeholder="Ex: AO"
                                maxLength={2}
                                value={formData.countryCode}
                                onChange={e => setFormData({ ...formData, countryCode: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg uppercase"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Transportadora</label>
                            <input
                                type="text"
                                value={formData.carrier}
                                onChange={e => setFormData({ ...formData, carrier: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Dias</label>
                                <input
                                    type="number"
                                    value={formData.baseDays}
                                    onChange={e => setFormData({ ...formData, baseDays: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Dias</label>
                                <input
                                    type="number"
                                    value={formData.maxDays}
                                    onChange={e => setFormData({ ...formData, maxDays: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                            Cancelar
                        </button>
                        <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg">
                            Salvar Rota
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : routes.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma rota configurada ainda.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">País</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Transportadora</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Prazo (Dias)</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {routes.map((route) => (
                                <tr key={route.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                                {route.countryCode}
                                            </div>
                                            <span className="font-medium text-gray-900">{route.countryName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {route.carrier}
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {route.baseDays} - {route.maxDays} dias
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(route)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(route.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
