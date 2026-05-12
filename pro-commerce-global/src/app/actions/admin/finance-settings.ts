"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const settingsSchema = z.object({
    vendorRegistrationFee: z.number().min(0),
    platformFeePercent: z.number().min(0).max(100),
    withdrawalFeePercent: z.number().min(0).max(100),
    adminPaymentInfo: z.string().optional()
})

export async function updateFinanceSettings(data: z.infer<typeof settingsSchema>) {
    const session = await auth()

    // Check Admin (simplified)
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    // In real app, verify role === 'ADMIN' via DB

    try {
        const validated = settingsSchema.parse(data)

        await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: {
                vendorRegistrationFee: validated.vendorRegistrationFee,
                platformFeePercent: validated.platformFeePercent,
                withdrawalFeePercent: validated.withdrawalFeePercent,
                adminPaymentInfo: validated.adminPaymentInfo
            },
            create: {
                id: "global",
                vendorRegistrationFee: validated.vendorRegistrationFee,
                platformFeePercent: validated.platformFeePercent,
                withdrawalFeePercent: validated.withdrawalFeePercent,
                adminPaymentInfo: validated.adminPaymentInfo
            }
        })

        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true }
    } catch (error) {
        console.error("Failed to update settings", error)
        return { success: false, error: "Failed to update settings" }
    }
}
