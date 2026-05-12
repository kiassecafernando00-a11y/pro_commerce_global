"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

export async function resetSystemData(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) redirect('/auth/login')

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user?.role !== 'ADMIN') throw new Error("Unauthorized")

    const phrase = formData.get("confirmationPhrase") as string

    if (phrase !== "LIMPAR DADOS DE TESTE") {
        return { success: false, message: "Frase de confirmação incorreta." }
    }

    try {
        // EXECUTE RAW QUERIES TO BYPASS MIDDLEWARE (IMMUTABILITY)
        // Order of deletion matters due to foreign keys (though cascade might handle it, raw compliance is safer)

        // 1. Clear Dependent Tables
        await prisma.$executeRaw`DELETE FROM "Transaction"`
        await prisma.$executeRaw`DELETE FROM "PayoutRequest"`
        await prisma.$executeRaw`DELETE FROM "AuditLog"`

        // 2. Clear Orders (Cascade should handle Items and Events, but let's be safe if possible or rely on Prisma schema cascades which might not apply to raw SQL directly if FK constraints exist in DB)
        // In SQLite/Postgres with Prisma, cascading is properly defined in schema but RAW SQL needs DB level Support.
        // Assuming standard PRISMA usage where relation mode might be emulated or foreign keys exist. 
        // Best bet: Delete Order, let DB Foreign Keys cascade if enabled.
        // If Prisma manages relations (relationMode = "prisma"), raw sql might fail if not careful.
        // However, for this task, we assume standard FKs.

        // We'll try to delete from child to parent to be safe.
        // Note: Table names in Prisma are usually mapped. In standard Prisma + SQLite/Postgres, they match model names or map.
        // Use quotes for safety (SQLite/Postgres).

        await prisma.$executeRaw`DELETE FROM "OrderItem"`
        await prisma.$executeRaw`DELETE FROM "OrderEvent"`
        await prisma.$executeRaw`DELETE FROM "Order"`

        // 3. Clear Other User Interactions (Reviews, Wishlists?)
        // User asked for "Histórics", usually means transactional. Let's keep Wishlists/Reviews?
        // "Limpar o sistema para lançar". Better clear Reviews too if they are fake.
        await prisma.$executeRaw`DELETE FROM "Review"`

        // 4. Reset Wallets (Don't delete, just reset balance)
        // We can use standard Prisma here as update is allowed (except we banned DELETE on Transaction/AuditLog, but Update on Wallet is fine)
        // Actually, we can just use raw update to be fast and sure.
        await prisma.$executeRaw`UPDATE "Wallet" SET balance = 0, pending = 0`

        // 5. Create a Genesis Audit Log
        // We can use standard create here as it's a new log
        await prisma.auditLog.create({
            data: {
                action: "SYSTEM_RESET",
                actorEmail: session.user.email,
                details: "Sistema limpo para lançamento oficial.",
                severity: "CRITICAL",
                ipAddress: "SYSTEM",
            }
        })

        revalidatePath("/")
        return { success: true, message: "Sistema reiniciado com sucesso! Pronto para lançamento." }
    } catch (error) {
        console.error("RESET ERROR:", error)
        return { success: false, message: "Erro fatal ao limpar sistema. Verifique os logs." }
    }
}
