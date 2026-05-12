
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

// GET /api/admin/coupons
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(coupons);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST /api/admin/coupons
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = body;

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
                maxUses: maxUses ? Number(maxUses) : null,
                endDate: expiresAt ? new Date(expiresAt) : null,
            },
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({ error: "Error creating coupon" }, { status: 500 });
    }
}
