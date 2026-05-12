
"use client";

import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function WishlistButton({
    productId,
    initialIsWishlisted = false,
}: {
    productId: string;
    initialIsWishlisted?: boolean;
}) {
    const { data: session } = useSession();
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [loading, setLoading] = useState(false);

    // Optionally fetch initial state if not provided (for product details page)
    useEffect(() => {
        if (session && !initialIsWishlisted) {
            // We could check if it's in the list, but for now relies on prop or local toggle
            // To mean "check if really in wishlist", we might need to fetch user wishlist
            // optimization: pass existing wishlist IDs from parent if possible.
        }
    }, [session, productId, initialIsWishlisted]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if inside a Link
        e.stopPropagation();

        if (!session) {
            toast.error("Faça login para adicionar aos favoritos");
            return;
        }

        setLoading(true);
        // Optimistic UI
        setIsWishlisted(!isWishlisted);

        try {
            const res = await fetch("/api/user/wishlist/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId }),
            });

            const data = await res.json();
            if (!res.ok) {
                setIsWishlisted(!isWishlisted); // Revert
                toast.error(data.error || "Erro ao atualizar favoritos");
            } else {
                toast.success(data.message, { icon: "❤" });
            }
        } catch (error) {
            setIsWishlisted(!isWishlisted); // Revert
            toast.error("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleWishlist}
            disabled={loading}
            className={`p-2 rounded-full transition-colors ${isWishlisted
                    ? "bg-red-50 text-red-500 hover:bg-red-100"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400"
                }`}
            title={isWishlisted ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
    );
}
