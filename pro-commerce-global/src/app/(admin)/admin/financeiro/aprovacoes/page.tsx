import { prisma } from "@/lib/prisma"
import AdminApprovals from "@/components/admin/finance/AdminApprovals"

export default async function AdminFinancePage() {
    const proofs = await prisma.paymentProof.findMany({
        where: { status: 'PENDING' },
        include: {
            store: {
                select: {
                    name: true,
                    commissionDebt: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    // Serialize Decimal
    const serializableProofs = proofs.map(p => ({
        ...p,
        amount: Number(p.amount),
        store: {
            ...p.store,
            commissionDebt: Number(p.store.commissionDebt)
        }
    }))

    return (
        <div className="max-w-5xl mx-auto p-8">
            <AdminApprovals proofs={serializableProofs} />
        </div>
    )
}
