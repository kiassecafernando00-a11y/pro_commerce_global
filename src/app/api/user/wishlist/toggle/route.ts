
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ error: "Product ID required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { wishlist: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Ensure wishlist exists
        let wishlist = user.wishlist;
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({
                data: { userId: user.id }
            });
        }

        // Check if item exists
        const existingItem = await prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId: productId
                }
            }
        });

        if (existingItem) {
            // Remove
            await prisma.wishlistItem.delete({
                where: { id: existingItem.id }
            });
            return NextResponse.json({ added: false, message: "Removed from wishlist" });
        } else {
            // Add
            await prisma.wishlistItem.create({
                data: {
                    wishlistId: wishlist.id,
                    productId: productId
                }
            });
            return NextResponse.json({ added: true, message: "Added to wishlist" });
        }

    } catch (error) {
        console.error("Error toggling wishlist:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
