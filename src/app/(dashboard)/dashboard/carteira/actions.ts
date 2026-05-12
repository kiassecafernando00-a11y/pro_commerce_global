'use server'

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { WalletService } from "@/services/financial/wallet.service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function getVendorBalance() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) {
        throw new Error("Store not found")
    }

    // Get or create wallet
    const wallet = await WalletService.getWallet(user.store.id)

    // Get transaction history
    const transactions = await WalletService.getHistory(user.store.id)

    return {
        balance: Number(wallet.balance),
        pending: Number(wallet.pending),
        transactions: transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount.toString(),
            description: t.description,
            status: t.status,
            createdAt: t.createdAt
        }))
    }
}

export async function requestWithdrawal(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) {
        throw new Error("Store not found")
    }

    const amount = parseFloat(formData.get('amount') as string)
    const iban = formData.get('iban') as string

    if (!amount || amount <= 0 || !iban) {
        throw new Error("Invalid withdrawal request")
    }

    // Get wallet
    const wallet = await WalletService.getWallet(user.store.id)

    // Check balance
    if (Number(wallet.balance) < amount) {
        throw new Error("Insufficient funds")
    }

    // Get Global Config for Fee
    const config = await prisma.systemConfig.findUnique({ where: { id: "global" } })
    const withdrawalFeePercent = Number(config?.withdrawalFeePercent || 1) // Default 1%

    const feeAmount = (amount * withdrawalFeePercent) / 100
    const netAmount = amount - feeAmount

    // Create payout request (Net Amount)
    const payoutRequest = await prisma.payoutRequest.create({
        data: {
            walletId: wallet.id,
            amount: netAmount,
            currency: 'AOA',
            status: 'PENDING',
            method: 'BANK_TRANSFER',
            details: JSON.stringify({ iban, holderName: user.store.name, feeDeducted: feeAmount, originalAmount: amount })
        }
    })

    // Transaction 1: Withdrawal (Full Amount Debit)
    // Actually, distinct approach: Debit full amount from wallet, but split into two transactions or one?
    // Let's do: 
    // - Debit Wallet: Total Amount (Requested)
    // - Transaction 1: WITHDRAWAL (Net Amount)
    // - Transaction 2: WITHDRAWAL_FEE (Fee Amount)

    await prisma.$transaction([
        // Update Wallet Balance (Decrement Full Amount)
        prisma.wallet.update({
            where: { id: wallet.id },
            data: {
                balance: { decrement: amount },
                pending: { increment: netAmount } // Only net amount goes to pending payout? No, usually we hold full amount or just net?
                // Logic: 
                // We owe them `netAmount`. `feeAmount` is ours immediately.
                // So pending increases by `netAmount`. 
                // `feeAmount` vanishes from their balance (Revenue).
            }
        }),

        // Transaction: Net Withdrawal
        prisma.transaction.create({
            data: {
                type: 'WITHDRAWAL',
                amount: netAmount,
                currency: 'AOA',
                status: 'PENDING',
                description: `Saque solicitado (Líquido). Taxa: ${withdrawalFeePercent}%`,
                walletId: wallet.id,
                storeId: user.store.id
            }
        }),

        // Transaction: Fee (Revenue)
        prisma.transaction.create({
            data: {
                type: 'WITHDRAWAL_FEE',
                amount: feeAmount,
                currency: 'AOA',
                status: 'COMPLETED',
                description: `Taxa de Saque (${withdrawalFeePercent}%) sobre ${amount} Kz`,
                walletId: wallet.id,
                storeId: user.store.id
            }
        })
    ])

    revalidatePath('/dashboard/carteira')
    return { success: true }
}
