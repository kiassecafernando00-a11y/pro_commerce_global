
"use client";

import { useState, useEffect } from "react";
import { Star, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
        name: string | null;
        image: string | null;
    };
}

export default function ProductReviews({ productId }: { productId: string }) {
    const { data: session } = useSession();
    const { t } = useLanguage();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/products/${productId}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Por favor, selecione uma classificação"); // This toast could be translated too if critical, but sticking to UI for now
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch(`/api/products/${productId}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, comment }),
            });

            if (res.ok) {
                toast.success(t('reviews_success'));
                setComment("");
                setRating(0);
                fetchReviews(); // Refresh list
            } else {
                const error = await res.json();
                toast.error(error.error || "Erro ao enviar avaliação");
            }
        } catch (error) {
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mt-16 border-t pt-10">
            <h2 className="text-2xl font-bold mb-6">{t('reviews_title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Review List */}
                <div>
                    {loading ? (
                        <div className="text-gray-500">{t('reviews_loading')}</div>
                    ) : reviews.length === 0 ? (
                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                            <p className="text-gray-500">{t('reviews_empty')}</p>
                            <p className="text-sm text-gray-400 mt-1">{t('reviews_be_first')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b pb-6 last:border-0 hover:bg-gray-50 p-4 rounded-lg transition-colors">
                                    <div className="flex items-center gap-4 mb-2">
                                        {review.user.image ? (
                                            <img src={review.user.image} alt={review.user.name || "User"} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold">{review.user.name || t('reviews_client')}</div>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="ml-auto text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 ml-14">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Write Review Form */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
                    <h3 className="text-lg font-bold mb-4">{t('reviews_write')}</h3>
                    {session ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('reviews_rating')}
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition-transform hover:scale-110 focus:outline-none`}
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-gray-300 hover:text-yellow-200"
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('reviews_comment')}
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-gold focus:border-transparent outline-none transition-all"
                                    placeholder={t('reviews_placeholder')}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-brand-dark text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? t('reviews_submitting') : t('reviews_submit')}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                                {t('reviews_login_req')}
                            </p>
                            <a
                                href="/auth/signin"
                                className="inline-block bg-brand-gold text-brand-dark px-6 py-2 rounded-full font-bold hover:bg-yellow-400 transition-colors"
                            >
                                {t('reviews_login_btn')}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
