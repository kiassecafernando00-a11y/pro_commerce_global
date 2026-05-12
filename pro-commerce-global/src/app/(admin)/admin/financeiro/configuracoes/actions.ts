"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function updateFeeConfig(formData: FormData) {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
        throw new Error("Unauthorized")
    }

    const type = formData.get('type') as string
    const value = parseFloat(formData.get('value') as string)

    if (!type || isNaN(value)) {
        throw new Error("Invalid data")
    }

    // Update SystemConfig based on type
    switch (type) {
        case 'COMMISSION':
            await prisma.systemConfig.update({
                where: { id: 'global' },
                data: { platformFeePercent: value }
            })
            break

        case 'REGISTRATION':
            await prisma.systemConfig.update({
                where: { id: 'global' },
                data: { vendorRegistrationFee: value }
            })
            break

        case 'WITHDRAWAL':
            // For now, we'll store this as a note
            // In future, create a FeeRule model
            console.log(`Withdrawal fee set to: ${value}`)
            break

        default:
            throw new Error("Invalid fee type")
    }

    // Create audit log
    await prisma.auditLog.create({
        data: {
            actorEmail: session.user.email,
            action: `UPDATED_FEE_${type}`,
            details: `Changed ${type} fee to ${value}`,
            ipAddress: null
        }
    })

    revalidatePath('/admin/financeiro')
    revalidatePath('/admin/financeiro/configuracoes')

    return { success: true }
}
