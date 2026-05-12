
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// GET /api/products/[id]/reviews
// Fetch approved reviews for a product
export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { id: productId } = await params;

        const reviews = await prisma.review.findMany({
            where: {
                productId: productId,
                status: "APPROVED", // Only show approved reviews publicly
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/products/[id]/reviews
// Submit a new review
export async function POST(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: productId } = await params;
        const body = await request.json();
        const { rating, comment } = body;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: "Invalid rating (1-5)" },
                { status: 400 }
            );
        }

        // Get user ID from email (since session might only have email depending on config)
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify if user purchased the product? For now, open to all authenticated users.
        // TODO: Add check for verified purchase if strictly required.

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: user.id,
                productId: productId
            }
        });

        if (existingReview) {
            return NextResponse.json(
                { error: "You have already reviewed this product" },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                userId: user.id,
                productId: productId,
                status: "APPROVED", // Auto-approve for now, or change to PENDING for moderation
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        console.error("Error creating review:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
