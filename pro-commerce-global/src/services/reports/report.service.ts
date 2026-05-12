import { prisma } from "@/lib/prisma"
import * as XLSX from 'xlsx'

export class ReportService {

    /**
     * Generate transaction report data for a store based on Orders
     */
    static async getTransactionReport(
        storeId: string,
        startDate?: Date,
        endDate?: Date
    ) {
        // Query Orders that have items from this store
        const where: any = {
            items: {
                some: {
                    product: { storeId }
                }
            },
            status: {
                in: ['PAID', 'SHIPPED', 'DELIVERED']
            }
        }

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = startDate
            if (endDate) where.createdAt.lte = endDate
        }

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    where: { product: { storeId } }, // Only fetch this store's items
                    include: { product: true }
                }
            }
        })

        // Map Orders to "Transaction" like rows
        return orders.map(order => {
            // Calculate total for this store in this order
            const storeTotal = order.items.reduce((sum, item) => {
                return sum + (Number(item.price) * item.quantity)
            }, 0)

            return {
                id: order.id,
                date: order.createdAt.toLocaleDateString('pt-AO'),
                type: 'SALE' as const, // Always SALE for now coming from orders
                description: `Venda #${order.id.slice(-6).toUpperCase()}`,
                amount: storeTotal,
                status: order.status,
                reference: order.paymentMethod,
                orderId: order.id
            }
        })
    }

    /**
     * Generate Excel file for transactions
     */
    static async generateExcel(
        storeId: string,
        storeName: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<Buffer> {
        const data = await this.getTransactionReport(storeId, startDate, endDate)

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(data, {
            header: ['date', 'type', 'description', 'amount', 'status', 'reference', 'orderId']
        })

        // Add header row
        XLSX.utils.sheet_add_aoa(ws, [
            ['Data', 'Tipo', 'Descrição', 'Valor (Kz)', 'Status', 'Ref. Pagamento', 'ID Pedido']
        ], { origin: 'A1' })

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Vendas')

        // Generate buffer
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        return buffer
    }

    /**
     * Generate CSV for transactions
     */
    static async generateCSV(
        storeId: string,
        startDate?: Date,
        endDate?: Date
    ): Promise<string> {
        const data = await this.getTransactionReport(storeId, startDate, endDate)

        // CSV header
        let csv = 'Data,Tipo,Descrição,Valor,Status,Referência,Pedido\n'

        // Add rows
        for (const row of data) {
            csv += `${row.date},"${row.type}","${row.description}",${row.amount},"${row.status}","${row.reference}","${row.orderId}"\n`
        }

        return csv
    }

    /**
     * Get summary statistics for a store based on Orders
     */
    static async getSummaryStats(storeId: string, startDate?: Date, endDate?: Date) {
        // Fetch Orders
        const where: any = {
            items: {
                some: {
                    product: { storeId }
                }
            },
            status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }
        }

        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = startDate
            if (endDate) where.createdAt.lte = endDate
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    where: { product: { storeId } }
                }
            }
        })

        // Calculate Stats
        let totalSales = 0
        let saleCount = orders.length

        for (const order of orders) {
            const orderTotal = order.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
            totalSales += orderTotal
        }

        // Estimates (Since we don't have real transaction ledger yet)
        const totalCommissions = totalSales * 0.05 // 5% Platform Fee
        const totalWithdrawals = 0 // Not tracked yet
        const withdrawalCount = 0
        const netRevenue = totalSales - totalCommissions

        return {
            totalSales,
            saleCount,
            totalCommissions,
            totalWithdrawals,
            withdrawalCount,
            netRevenue
        }
    }
}
