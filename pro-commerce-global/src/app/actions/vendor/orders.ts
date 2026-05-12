"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { AuditService } from "@/services/audit"

export async function approveVendorOrderPayment(orderId: string) {
    try {
        const session = await getServerSession(authOptions)

        // 1. Authentication & Role Check
        if (!session?.user?.id || session.user.role !== "VENDOR") {
            return { success: false, error: "Não autorizado" }
        }

        // 2. Verify Vendor Store
        const store = await prisma.store.findUnique({
            where: { userId: session.user.id }
        })

        if (!store) {
            return { success: false, error: "Loja não encontrada" }
        }

        // 3. Verify Order Ownership (Order must contain items from this vendor)
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } }
        })

        if (!order) {
            return { success: false, error: "Pedido não encontrado" }
        }

        const hasVendorItems = order.items.some(item => item.product.storeId === store.id)
        if (!hasVendorItems) {
            return { success: false, error: "Permissão negada para este pedido" }
        }

        // 4. Update Order Status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: "PAID",
                events: {
                    create: {
                        status: "PAGAMENTO_APROVADO",
                        description: `Pagamento aprovado pela loja ${store.name}`,
                        location: "Painel do Vendedor"
                    }
                }
            }
        })

        // 5. Automatic Commission Calculation (Global Finance Logic)
        try {
            // Fetch Global Config
            const config = await prisma.systemConfig.findUnique({ where: { id: "global" } })
            const platformFeePercent = Number(config?.platformFeePercent || 5) // Default 5%

            // Calculate Commission
            const orderTotal = Number(order.total)
            const commissionAmount = (orderTotal * platformFeePercent) / 100

            // Update Store Debt & Create Transaction
            await prisma.$transaction([
                // Update Store Debt
                prisma.store.update({
                    where: { id: store.id },
                    data: {
                        commissionDebt: { increment: commissionAmount }
                    }
                }),
                // Create Transaction Record (Immutable)
                prisma.transaction.create({
                    data: {
                        type: "COMMISSION_DEBT",
                        amount: commissionAmount,
                        currency: order.currency,
                        status: "COMPLETED",
                        description: `Comissão da Plataforma (${platformFeePercent}%) - Pedido #${order.id.slice(-6)}`,
                        reference: order.id,
                        storeId: store.id,
                        orderId: order.id
                    }
                })
            ])
        } catch (feeError) {
            console.error("Critical Error: Failed to calculate commission", feeError)
            // We do not roll back the order update, but we log this critical error. 
            // In a real banking system we might rollback, but for UX here we prioritize order status.
        }

        // 6. Audit Log
        await AuditService.log({
            action: "APPROVE_PAYMENT",
            entityType: "ORDER",
            entityId: orderId,
            actorId: session.user.id,
            actorEmail: session.user.email || "vendor@system",
            details: JSON.stringify({
                storeId: store.id,
                storeName: store.name,
                previousStatus: order.status,
                newStatus: "PAID"
            })
        })

        revalidatePath("/dashboard/vendas")
        revalidatePath("/dashboard/loja/pagamentos") // Update payments page
        return { success: true }

    } catch (error) {
        console.error("[VENDOR_APPROVE_PAYMENT]", error)
        return { success: false, error: "Erro ao aprovar pagamento" }
    }
}
