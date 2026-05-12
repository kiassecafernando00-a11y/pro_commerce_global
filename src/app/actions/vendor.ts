"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addBankAccount(data: { bankName: string, iban: string, holderName: string }) {
    const session = await auth()
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) return { success: false, error: "Store not found" }

    try {
        await prisma.storeBankAccount.create({
            data: {
                storeId: user.store.id,
                bankName: data.bankName,
                iban: data.iban,
                holderName: data.holderName
            }
        })
        revalidatePath("/dashboard/loja/configuracoes")
        return { success: true }
    } catch (e) {
        console.error("Failed to add bank account", e)
        return { success: false, error: "Failed to add account" }
    }
}

export async function deleteBankAccount(id: string) {
    const session = await auth()
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) return { success: false, error: "Store not found" }

    try {
        // Verify ownership
        const account = await prisma.storeBankAccount.findUnique({
            where: { id }
        })

        if (!account || account.storeId !== user.store.id) {
            return { success: false, error: "Unauthorized" }
        }

        await prisma.storeBankAccount.delete({ where: { id } })
        revalidatePath("/dashboard/loja/configuracoes")
        return { success: true }
    } catch (e) {
        return { success: false, error: "Failed to delete" }
    }
}
