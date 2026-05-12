
import { prisma } from "@/lib/prisma"
import { WalletService } from "./wallet.service"
import { EmailService } from "@/services/notifications/email.service"

export class OrderFinancialService {

    /**
     * Process order payment and credit seller wallet
     * Called when order status changes to PAID
     */
    static async processOrderPayment(orderId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { store: true }
                        }
                    }
                }
            }
        })

        if (!order) throw new Error("Order not found")

        // Get platform fee configuration
        const config = await prisma.systemConfig.findUnique({
            where: { id: 'global' }
        })

        const feePercent = Number(config?.platformFeePercent || 5) // Default 5%

        // Group items by store
        const storeGroups = new Map<string, { storeId: string, storeName: string, total: number }>()

        for (const item of order.items) {
            const storeId = item.product.storeId
            const storeName = item.product.store.name
            const itemTotal = Number(item.price) * item.quantity

            if (!storeGroups.has(storeId)) {
                storeGroups.set(storeId, { storeId, storeName, total: 0 })
            }

            storeGroups.get(storeId)!.total += itemTotal
        }

        // Process each store's earnings
        for (const [storeId, { storeName, total }] of storeGroups) {
            const commission = total * (feePercent / 100)
            const netAmount = total - commission

            // Get or create wallet
            const wallet = await WalletService.getWallet(storeId)

            // Credit wallet with NET amount (after commission)
            await WalletService.creditWallet(
                storeId,
                netAmount,
                'SALE',
                `Venda do pedido #${order.id}`,
                order.id,
                order.id
            )

            // Record commission as platform revenue
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    storeId: storeId,
                    type: 'COMMISSION',
                    amount: commission,
                    currency: 'AOA',
                    status: 'COMPLETED',
                    description: `Comissão da plataforma (${feePercent}%) - Pedido #${order.id}`,
                    reference: order.id,
                    orderId: order.id
                }
            })

            // Send email notification to vendor
            const store = await prisma.store.findUnique({
                where: { id: storeId },
                include: { user: true }
            })

            if (store?.user?.email) {
                await EmailService.sendSaleCredited(
                    store.user.email,
                    storeName,
                    total,
                    commission,
                    netAmount,
                    order.id
                )
            }
        }

        return { success: true }
    }
}
