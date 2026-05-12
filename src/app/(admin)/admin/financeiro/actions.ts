
"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Helper for EmailService if not imported
const EmailService = {
    sendPayoutApproved: async (email: string, storeName: string, amount: number, id: string) => {
        console.log(`[Mock Email] Sending Payout Approved to ${email} for ${amount} Kz`)
    }
}

// --- Payout Request Actions (Financeiro Original) ---

export async function approvePayoutRequest(formData: FormData) {
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

    const payoutId = formData.get('payoutId') as string

    const payout = await prisma.payoutRequest.findUnique({
        where: { id: payoutId },
        include: { wallet: true }
    })

    if (!payout || payout.status !== 'PENDING') {
        return { success: false, message: "Invalid payout request" }
    }

    // Update Payout Status
    await prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
            status: 'COMPLETED',
            processedAt: new Date()
        }
    })

    // Update Transaction Status (Withdrawal) if it exists
    // The financeiro flow seems to link PayoutRequest to Wallet and Transaction logic might be implicit or separate.
    // Assuming we need to deduct from wallet pending balance
    await prisma.wallet.update({
        where: { id: payout.walletId },
        data: {
            pending: { decrement: Number(payout.amount) },
            // Depending on logic, it might move to 'payouts' or just leave the system?
            // Usually 'pending' means requested. If completed, it leaves the wallet.
        }
    })

    // Create a transaction record for the withdrawal completion if not already linked
    await prisma.transaction.create({
        data: {
            type: "WITHDRAWAL",
            amount: payout.amount,
            currency: "AOA", // Default
            status: "COMPLETED",
            description: `Saque processado: ${payoutId}`,
            walletId: payout.walletId,
            storeId: payout.wallet.storeId,
            reference: payoutId
        }
    })

    // Get vendor details for email
    const store = await prisma.store.findUnique({
        where: { id: payout.wallet.storeId || "" }, // handle null
        include: { user: true }
    })

    // Send approval email
    if (store?.user?.email) {
        await EmailService.sendPayoutApproved(
            store.user.email,
            store.name,
            Number(payout.amount),
            payout.id
        )
    }

    // SECURITY AUDIT LOG
    const { AuditService } = await import("@/services/audit")
    await AuditService.log({
        action: "PAYOUT_APPROVED",
        actorEmail: session.user.email,
        actorId: session.user.id,
        entityId: payoutId,
        entityType: "PAYOUT_REQUEST",
        details: `Saque aprovado: ${payout.amount} AOA para ${store?.name}`,
        metadata: { amount: payout.amount, walletId: payout.walletId },
        severity: "HIGH"
    })

    revalidatePath('/admin/financeiro')
    return { success: true }
}

export async function rejectPayoutRequest(formData: FormData) {
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

    const payoutId = formData.get('payoutId') as string

    const payout = await prisma.payoutRequest.findUnique({
        where: { id: payoutId },
        include: { wallet: true }
    })

    if (!payout || payout.status !== 'PENDING') {
        return { success: false, message: "Invalid payout request" }
    }

    await prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
            status: 'REJECTED',
            processedAt: new Date()
        }
    })

    // Return funds to wallet balance
    await prisma.wallet.update({
        where: { id: payout.walletId },
        data: {
            pending: { decrement: Number(payout.amount) },
            balance: { increment: Number(payout.amount) } // Return to available balance
        }
    })

    // SECURITY AUDIT LOG
    const { AuditService } = await import("@/services/audit")
    await AuditService.log({
        action: "PAYOUT_REJECTED",
        actorEmail: session.user.email,
        actorId: session.user.id,
        entityId: payoutId,
        entityType: "PAYOUT_REQUEST",
        details: `Saque rejeitado: ${payout.amount} AOA`,
        metadata: { amount: payout.amount },
        severity: "MEDIUM"
    })

    revalidatePath('/admin/financeiro')
    return { success: true }
}


// --- Currency Actions (Migrated from Finance) ---

const rateSchema = z.object({
    id: z.string(),
    rate: z.coerce.number().positive("A taxa deve ser positiva")
})

export async function updateExchangeRate(formData: FormData) {
    const id = formData.get("id") as string
    const rate = formData.get("rate")

    const validated = rateSchema.safeParse({ id, rate })

    if (!validated.success) {
        return { success: false, message: "Dados inválidos." }
    }

    try {
        await prisma.currency.update({
            where: { id: validated.data.id },
            data: {
                exchangeRateToAOA: validated.data.rate,
                updatedAt: new Date()
            }
        })

        revalidatePath("/admin/financeiro")
        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true, message: "Taxa de câmbio atualizada!" }
    } catch (error) {
        console.error("Failed to update rate:", error)
        return { success: false, message: "Erro ao atualizar taxa." }
    }
}

export async function toggleCurrencyStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.currency.update({
            where: { id },
            data: { isActive: !currentStatus }
        })
        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function seedDefaultCurrencies() {
    try {
        const currencies = [
            { code: "AOA", name: "Kwanza Angolano", symbol: "Kz", exchangeRateToAOA: 1, isActive: true },
            { code: "USD", name: "Dólar Americano", symbol: "$", exchangeRateToAOA: 900, isActive: true },
            { code: "EUR", name: "Euro", symbol: "€", exchangeRateToAOA: 980, isActive: true }
        ]

        await Promise.all(currencies.map(curr =>
            prisma.currency.upsert({
                where: { code: curr.code },
                update: {}, // Don't overrite if exists, just ensure it exists.
                create: {
                    code: curr.code,
                    name: curr.name,
                    symbol: curr.symbol,
                    exchangeRateToAOA: curr.exchangeRateToAOA,
                    isActive: curr.isActive
                }
            })
        ))

        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true }
    } catch (error) {
        console.error("Seed Error:", error)
        return { success: false }
    }
}

// --- Bank Account Actions (Migrated from Finance) ---

export async function addBankAccount(formData: FormData) {
    const bankName = formData.get("bankName") as string
    const holderName = formData.get("holderName") as string
    const iban = formData.get("iban") as string
    const currency = formData.get("currency") as string
    const instructions = formData.get("instructions") as string

    if (!bankName || !holderName || !iban) {
        return { success: false, message: "Preencha todos os campos obrigatórios." }
    }

    try {
        await prisma.bankAccount.create({
            data: {
                bankName,
                holderName,
                iban,
                currency,
                instructions,
                isActive: true
            }
        })
        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true, message: "Conta bancária adicionada." }
    } catch (error) {
        console.error("Failed to add bank account:", error)
        return { success: false, message: "Erro ao adicionar conta." }
    }
}

export async function deleteBankAccount(id: string) {
    try {
        await prisma.bankAccount.delete({
            where: { id }
        })
        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function toggleBankAccount(id: string, currentStatus: boolean) {
    try {
        await prisma.bankAccount.update({
            where: { id },
            data: { isActive: !currentStatus }
        })
        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

// --- Gateway Actions (Migrated from Finance) ---

export async function updateGatewayConfig(provider: string, formData: FormData) {
    const isActive = formData.get("isActive") === "on"
    const publicKey = formData.get("publicKey") as string
    const secretKey = formData.get("secretKey") as string

    try {
        // Build update data object
        const data: any = { isActive, updatedAt: new Date() }
        if (publicKey) data.publicKey = publicKey
        if (secretKey) data.secretKey = secretKey

        // Use upsert to create if not exists or update if exists
        await prisma.paymentMethodConfig.upsert({
            where: { provider },
            update: data,
            create: {
                provider,
                name: provider === "STRIPE" ? "Stripe" : "Binance Pay",
                isActive,
                publicKey: publicKey || "",
                secretKey: secretKey || "",
                isInternational: true,
                supportedCurrencies: "USD,EUR"
            }
        })

        revalidatePath("/admin/financeiro/configuracoes")
        return { success: true, message: "Configuração salva." }
    } catch (error) {
        console.error("Failed to update gateway:", error)
        return { success: false, message: "Erro ao atualizar configuração." }
    }
}
