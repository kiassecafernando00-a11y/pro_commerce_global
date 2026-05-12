"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import WishlistButton from "@/components/products/WishlistButton";

interface WishlistItem {
    id: string;
    product: {
        id: string;
        name: string;
        price: number;
        images: string;
        store: { name: string };
    };
}

export default function WishlistPage() {
    const { data: session, status } = useSession();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "authenticated") {
            fetchWishlist();
        } else if (status === "unauthenticated") {
            setLoading(false);
        }
    }, [status]);

    const fetchWishlist = async () => {
        try {
            const res = await fetch("/api/user/wishlist");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-brand-dark">Carregando favoritos...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Heart className="w-16 h-16 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Faça login para ver seus favoritos</h1>
                <p className="text-gray-500 mb-8">Guarde os produtos que mais gosta.</p>
                <Link href="/auth/signin" className="bg-brand-gold text-brand-dark px-8 py-3 rounded-full font-bold">
                    Entrar
                </Link>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 inline-block max-w-lg w-full text-center">
                    <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">A sua Lista de Desejos está vazia</h1>
                    <p className="text-gray-500 mb-8">
                        Guarde os produtos que mais gosta para comprar depois.
                    </p>
                    <Link
                        href="/produtos"
                        className="bg-brand-gold text-brand-dark px-8 py-3 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                    >
                        Ver Produtos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-brand-dark mb-8 flex items-center gap-3">
                    <Heart className="fill-brand-gold text-brand-gold" />
                    Meus Favoritos
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => {
                        let image = "/placeholder.png";
                        try {
                            const parsed = JSON.parse(item.product.images);
                            if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
                            else if (typeof parsed === 'string') image = parsed;
                        } catch (e) { image = item.product.images }

                        return (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                                <div className="absolute top-3 right-3 z-10">
                                    <WishlistButton productId={item.product.id} initialIsWishlisted={true} />
                                </div>
                                <div className="h-48 bg-gray-100 overflow-hidden">
                                    <img src={image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-500 mb-1">{item.product.store.name}</p>
                                    <h3 className="font-bold text-gray-900 mb-2 truncate" title={item.product.name}>{item.product.name}</h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-brand-dark">Kz {Number(item.product.price).toLocaleString()}</span>
                                        <Link href={`/produtos/${item.product.id}`} className="p-2 bg-brand-dark text-white rounded-lg hover:bg-gray-800">
                                            <ShoppingBag className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
