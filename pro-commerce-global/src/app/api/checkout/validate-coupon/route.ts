
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { code, cartTotal } = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Code required" }, { status: 400 });
        }

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json({ error: "Cupom inválido" }, { status: 404 });
        }

        if (!coupon.isActive) {
            return NextResponse.json({ error: "Este cupom expirou" }, { status: 400 });
        }

        if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
            return NextResponse.json({ error: "Este cupom expirou" }, { status: 400 });
        }

        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return NextResponse.json({ error: "Este cupom atingiu o limite de usos" }, { status: 400 });
        }

        if (coupon.minOrderAmount && Number(cartTotal) < Number(coupon.minOrderAmount)) {
            return NextResponse.json({
                error: `Valor mínimo para este cupom: Kz ${Number(coupon.minOrderAmount).toLocaleString()}`
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (Number(cartTotal) * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscount && discountAmount > Number(coupon.maxDiscount)) {
                discountAmount = Number(coupon.maxDiscount);
            }
        } else {
            discountAmount = Number(coupon.discountValue);
        }

        return NextResponse.json({
            valid: true,
            couponCode: coupon.code,
            discountAmount: discountAmount,
            discountType: coupon.discountType
        });

    } catch (error) {
        console.error("Error validating coupon:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
