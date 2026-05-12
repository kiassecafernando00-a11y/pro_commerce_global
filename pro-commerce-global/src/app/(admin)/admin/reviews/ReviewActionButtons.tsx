
"use client";

import { Check, X, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ReviewActionButtons({
    reviewId,
    currentStatus,
}: {
    reviewId: string;
    currentStatus: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const updateStatus = async (status: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (res.ok) {
                toast.success(`Avaliação ${status === "APPROVED" ? "Aprovada" : "Rejeitada"}`);
                router.refresh();
            } else {
                toast.error("Erro ao atualizar status");
            }
        } catch (error) {
            toast.error("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };

    const deleteReview = async () => {
        if (!confirm("Tem certeza que deseja excluir esta avaliação?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Avaliação excluída");
                router.refresh();
            } else {
                toast.error("Erro ao excluir");
            }
        } catch (error) {
            toast.error("Erro desconhecido");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex gap-2">
            {currentStatus !== "APPROVED" && (
                <button
                    onClick={() => updateStatus("APPROVED")}
                    disabled={loading}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Aprovar"
                >
                    <Check className="w-4 h-4" />
                </button>
            )}
            {currentStatus !== "REJECTED" && (
                <button
                    onClick={() => updateStatus("REJECTED")}
                    disabled={loading}
                    className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                    title="Rejeitar"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
            <button
                onClick={deleteReview}
                disabled={loading}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Excluir"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
