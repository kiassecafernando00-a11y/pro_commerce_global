import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const store = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        return NextResponse.json(store)
    } catch (error) {
        console.error("[STORE_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, description, logo, banner, address, phone, latitude, longitude, deliveryPricePerKm, deliveryBaseFee } = body

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        const existingStore = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (existingStore) {
            return new NextResponse("Store already exists", { status: 409 })
        }

        const store = await prisma.store.create({
            data: {
                name,
                description,
                logo,
                banner,
                address,
                phone,
                latitude,
                longitude,
                deliveryPricePerKm,
                deliveryBaseFee,
                userId: session.user.id,
            },
        })

        return NextResponse.json(store)
    } catch (error) {
        console.error("[STORE_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const { name, description, logo, banner, address, phone, latitude, longitude, deliveryPricePerKm, deliveryBaseFee } = body

        const existingStore = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!existingStore) {
            return new NextResponse("Store not found", { status: 404 })
        }

        const store = await prisma.store.update({
            where: {
                id: existingStore.id,
            },
            data: {
                name,
                description,
                logo,
                banner,
                address,
                phone,
                latitude,
                longitude,
                deliveryPricePerKm,
                deliveryBaseFee,
            },
        })

        return NextResponse.json(store)
    } catch (error) {
        console.error("[STORE_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
