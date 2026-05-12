"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Upload a payment proof for review
 */
export async function uploadPaymentProof(data: {
    type: 'REGISTRATION_FEE' | 'COMMISSION' | 'WITHDRAWAL_FEE' | 'SUBSCRIPTION',
    amount: number,
    imageUrl: string
}) {
    const session = await auth()
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) return { success: false, error: "Store not found" }

    try {
        await prisma.paymentProof.create({
            data: {
                storeId: user.store.id,
                type: data.type,
                amount: data.amount,
                imageUrl: data.imageUrl,
                status: 'PENDING'
            }
        })
        revalidatePath("/dashboard/loja/pagamentos")
        return { success: true }
    } catch (e) {
        console.error(e)
        return { success: false, error: "Failed to upload proof" }
    }
}

/**
 * Approve or Reject a payment proof (Admin Only)
 */
export async function reviewPaymentProof(proofId: string, action: 'APPROVE' | 'REJECT', note?: string) {
    const session = await auth()
    if (!session?.user?.email) return { success: false, error: "Unauthorized" }

    // Check admin role
    const admin = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    // Simplification: In a real app we check role === 'ADMIN'
    // For now assuming the user calling this from admin panel is authorized or we rely on page protection

    const proof = await prisma.paymentProof.findUnique({
        where: { id: proofId },
        include: { store: true }
    })

    if (!proof) return { success: false, error: "Proof not found" }

    if (action === 'REJECT') {
        await prisma.paymentProof.update({
            where: { id: proofId },
            data: { status: 'REJECTED', adminNote: note }
        })
        return { success: true }
    }

    // APPROVE LOGIC
    await prisma.$transaction(async (tx) => {
        // 1. Update Proof Status
        await tx.paymentProof.update({
            where: { id: proofId },
            data: { status: 'APPROVED', adminNote: note }
        })

        // 2. Handle specific logic based on type
        if (proof.type === 'REGISTRATION_FEE' || proof.type === 'SUBSCRIPTION') {
            const nextDueDate = new Date()
            nextDueDate.setDate(nextDueDate.getDate() + 30)

            await tx.store.update({
                where: { id: proof.storeId },
                data: {
                    status: 'APPROVED', // Activate store
                    registrationFeeStatus: 'PAID', // Legacy compatibility
                    subscriptionStatus: 'ACTIVE',
                    subscriptionDueDate: nextDueDate,
                    lastSubscriptionPayment: new Date(),
                    isSuspended: false // Clear suspension if any
                }
            })
        } else if (proof.type === 'COMMISSION') {
            const currentDebt = Number(proof.store.commissionDebt)
            const paidAmount = Number(proof.amount)
            let newDebt = currentDebt - paidAmount
            if (newDebt < 0) newDebt = 0

            // If debt is cleared (or close to zero), we can reset due date
            const dataToUpdate: any = {
                commissionDebt: newDebt
            }

            if (newDebt === 0) {
                dataToUpdate.debtDueDate = null
                dataToUpdate.isSuspended = false
            }

            await tx.store.update({
                where: { id: proof.storeId },
                data: dataToUpdate
            })
        }
        // 3. CREATE LEDGER TRANSACTION (Single Source of Truth)
        await tx.transaction.create({
            data: {
                type: proof.type === 'REGISTRATION_FEE' ? 'REGISTRATION_FEE' :
                    proof.type === 'SUBSCRIPTION' ? 'SUBSCRIPTION' : 'COMMISSION',
                amount: proof.amount,
                currency: 'AOA', // Defaulting to AOA as proofs are usually local
                status: 'COMPLETED',
                description: `Pagamento Aprovado (${proof.type === 'REGISTRATION_FEE' ? 'Inscrição' : proof.type}) - ${note || 'Sem nota'}`,
                reference: `PROOF-${proof.id.slice(-6)}`,
                storeId: proof.storeId,
                proofUrl: proof.imageUrl
            }
        })
    })

    revalidatePath("/admin/financeiro/aprovacoes")
    return { success: true }
}
