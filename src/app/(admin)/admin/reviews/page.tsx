
import { prisma } from "@/lib/prisma";
import { Check, X, Star } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import ReviewActionButtons from "./ReviewActionButtons";

export default async function AdminReviewsPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const reviews = await prisma.review.findMany({
        include: {
            user: { select: { name: true, email: true } },
            product: { select: { name: true, images: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Moderação de Avaliações</h1>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-600">Dado</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Produto</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Usuário</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Avaliação</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="p-4 text-sm font-semibold text-gray-600">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {reviews.map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50">
                                <td className="p-4 text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 group max-w-xs truncate" title={review.product.name}>
                                    {review.product.name}
                                </td>
                                <td className="p-4">
                                    <div className="font-medium text-gray-900">{review.user.name}</div>
                                    <div className="text-sm text-gray-500">{review.user.email}</div>
                                </td>
                                <td className="p-4 max-w-md">
                                    <div className="flex text-yellow-400 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                                </td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${review.status === "APPROVED"
                                                ? "bg-green-100 text-green-700"
                                                : review.status === "REJECTED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {review.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <ReviewActionButtons reviewId={review.id} currentStatus={review.status} />
                                </td>
                            </tr>
                        ))}
                        {reviews.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    Nenhuma avaliação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
