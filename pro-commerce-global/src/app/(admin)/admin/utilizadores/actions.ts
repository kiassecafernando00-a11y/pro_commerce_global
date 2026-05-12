
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { createAuditLog } from "@/lib/audit"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
    // Prevent banning the main admin (safety check)
    // In production, check session role too
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user?.email === "admin@procommerce.com") return { error: "Cannot ban Super Admin" }

    await prisma.user.update({
        where: { id: userId },
        data: { isActive: !currentStatus }
    })
    revalidatePath("/admin/utilizadores")
}

export async function approveStore(storeId: string) {
    const session = await getServerSession(authOptions)

    await prisma.store.update({
        where: { id: storeId },
        data: {
            status: "APPROVED",
            registrationFeeStatus: "PAID"
        }
    })

    if (session?.user?.email) {
        await createAuditLog(
            session.user.email,
            "APPROVED_STORE",
            `Store ID: ${storeId}`,
            { storeId }
        )
    }

    // Ideally, send email notification here
    revalidatePath("/admin/utilizadores")
}

export async function rejectStore(storeId: string) {
    await prisma.store.update({
        where: { id: storeId },
        data: { status: "REJECTED" }
    })
    // Ideally, send email notification here
    revalidatePath("/admin/utilizadores")
}

export async function suspendStore(storeId: string) {
    await prisma.store.update({
        where: { id: storeId },
        data: { status: "BANNED" }
    })
    revalidatePath("/admin/utilizadores")
}

export async function reactivateStore(storeId: string) {
    await prisma.store.update({
        where: { id: storeId },
        data: { status: "APPROVED" }
    })
    revalidatePath("/admin/utilizadores")
}

export async function deleteStore(storeId: string) {
    await prisma.store.delete({
        where: { id: storeId }
    })
    revalidatePath("/admin/utilizadores")
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({
            where: { id: userId }
        })
        revalidatePath("/admin/utilizadores")
    } catch (e) {
        console.error("Failed to delete user", e)
        // Helper if needed: return { error: "Failed to delete" }
    }
}
