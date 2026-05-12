import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { bankName, iban, holderName } = body

        if (!bankName || !iban || !holderName) {
            return new NextResponse("Missing fields", { status: 400 })
        }

        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        const bankAccount = await prisma.storeBankAccount.create({
            data: {
                storeId: store.id,
                bankName,
                iban,
                holderName
            }
        })

        return NextResponse.json(bankAccount)

    } catch (error) {
        console.error("[BANK_ACCOUNT_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const id = searchParams.get("id")

        if (!id) {
            return new NextResponse("Missing ID", { status: 400 })
        }

        // Verify ownership
        const bankAccount = await prisma.storeBankAccount.findUnique({
            where: { id },
            include: { store: true }
        })

        if (!bankAccount || bankAccount.store.userId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        await prisma.storeBankAccount.delete({
            where: { id }
        })

        return new NextResponse("Deleted", { status: 200 })

    } catch (error) {
        console.error("[BANK_ACCOUNT_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
