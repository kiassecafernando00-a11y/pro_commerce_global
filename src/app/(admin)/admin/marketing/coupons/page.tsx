
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "react-hot-toast";

interface Coupon {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    maxUses: number | null;
    usedCount: number;
    isActive: boolean;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        minOrderAmount: "",
        maxUses: "",
        expiresAt: "",
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/admin/coupons");
            if (res.ok) {
                const data = await res.json();
                setCoupons(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

        try {
            const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Cupom excluído");
                fetchCoupons();
            } else {
                toast.error("Erro ao excluir");
            }
        } catch (e) {
            toast.error("Erro de conexão");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                toast.success("Cupom criado com sucesso!");
                setShowModal(false);
                setFormData({
                    code: "",
                    discountType: "PERCENTAGE",
                    discountValue: "",
                    minOrderAmount: "",
                    maxUses: "",
                    expiresAt: "",
                });
                fetchCoupons();
            } else {
                toast.error("Erro ao criar cupom");
            }
        } catch (e) {
            toast.error("Erro de conexão");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Tag className="w-6 h-6 text-brand-gold" />
                    Gestão de Cupons
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
                >
                    <Plus className="w-4 h-4" /> Novo Cupom
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4">Código</th>
                            <th className="p-4">Desconto</th>
                            <th className="p-4">Usos</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-900">{coupon.code}</td>
                                <td className="p-4">
                                    {coupon.discountType === "PERCENTAGE"
                                        ? `${coupon.discountValue}%`
                                        : `Kz ${coupon.discountValue}`}
                                </td>
                                <td className="p-4">
                                    {coupon.usedCount} / {coupon.maxUses || "∞"}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {coupon.isActive ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {coupons.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum cupom encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Novo Cupom</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700">Código</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full border p-2 rounded uppercase" // Force uppercase visual
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="EX: NATAL2025"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Tipo</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="PERCENTAGE">Porcentagem (%)</option>
                                        <option value="FIXED">Valor Fixo (Kz)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700">Valor</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full border p-2 rounded"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        placeholder="Ex: 10"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-gray-800"
                                >
                                    Criar Cupom
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
