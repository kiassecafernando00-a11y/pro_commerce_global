"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

async function logAudit(action: string, details: string) {
    const session = await getServerSession(authOptions)
    await prisma.auditLog.create({
        data: {
            actorEmail: session?.user?.email || "system",
            action,
            details
        }
    })
}

export async function approveProduct(id: string) {
    await prisma.product.update({ where: { id }, data: { status: "APPROVED" } })
    await logAudit("APPROVE_PRODUCT", `Approved product ${id}`)
    revalidatePath("/admin/produtos")
}

export async function rejectProduct(id: string) {
    await prisma.product.update({ where: { id }, data: { status: "REJECTED" } })
    await logAudit("REJECT_PRODUCT", `Rejected product ${id}`)
    revalidatePath("/admin/produtos")
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({ where: { id } })
    await logAudit("DELETE_PRODUCT", `Deleted product ${id}`)
    revalidatePath("/admin/produtos")
}
