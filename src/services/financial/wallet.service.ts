
import { prisma } from "@/lib/prisma"

export type TransactionType = 'SALE' | 'COMMISSION' | 'WITHDRAWAL' | 'REGISTRATION_FEE' | 'REFUND' | 'ADJUSTMENT'

export class WalletService {

    /**
     * Get or Create a wallet for a store
     */
    static async getWallet(storeId: string) {
        let wallet = await prisma.wallet.findUnique({
            where: { storeId }
        })

        if (!wallet) {
            wallet = await prisma.wallet.create({
                data: { storeId }
            })
        }
        return wallet
    }

    /**
     * Credit a wallet (e.g. Sale)
     * Wraps in transaction to ensure consistency
     */
    static async creditWallet(storeId: string, amount: number, type: TransactionType, description: string, reference?: string, orderId?: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get Wallet
            const wallet = await tx.wallet.findUnique({ where: { storeId } })
            if (!wallet) throw new Error("Wallet not found")

            // 2. Create Transaction Record
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type,
                    amount, // Positive for Credit
                    currency: wallet.currency,
                    status: 'COMPLETED',
                    description,
                    reference,
                    orderId,
                    storeId // Optional redundancy for easy querying
                }
            })

            // 3. Update Balance
            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { increment: amount }
                }
            })

            return { transaction, wallet: updatedWallet }
        })
    }

    /**
     * Debit a wallet (e.g. Withdrawal, Refund, Commission)
     */
    static async debitWallet(storeId: string, amount: number, type: TransactionType, description: string, reference?: string) {
        return await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({ where: { storeId } })
            if (!wallet) throw new Error("Wallet not found")

            // Check Balance (Optional: Allow overdrafts? No, strictly prevent negative balance for withdrawals)
            if (wallet.balance.toNumber() < amount) {
                throw new Error("Insufficient funds")
            }

            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    type,
                    amount: -amount, // Negative for Debit visual, but logic implies subtraction
                    currency: wallet.currency,
                    status: 'COMPLETED',
                    description,
                    reference
                }
            })

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: { decrement: amount }
                }
            })

            return { transaction, wallet: updatedWallet }
        })
    }

    /**
     * Get Transaction History
     */
    static async getHistory(storeId: string) {
        return await prisma.transaction.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' }
        })
    }
}
