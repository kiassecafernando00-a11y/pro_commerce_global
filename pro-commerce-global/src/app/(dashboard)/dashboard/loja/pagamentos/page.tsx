import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import VendorPayments from "@/components/vendor/VendorPayments"

export default async function VendorPaymentsPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: true }
    })

    if (!user?.store) {
        return <div>Loja não encontrada</div>
    }

    const systemConfig = await prisma.systemConfig.findUnique({
        where: { id: "global" }
    })

    // Prepare serializable store data
    const storeData = {
        status: user.store.status,
        commissionDebt: Number(user.store.commissionDebt || 0),
        debtDueDate: user.store.debtDueDate,
        isSuspended: user.store.isSuspended,
        subscriptionStatus: user.store.subscriptionStatus || "INACTIVE",
        subscriptionDueDate: user.store.subscriptionDueDate
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8">
            <VendorPayments
                store={storeData}
                adminPaymentInfo={systemConfig?.adminPaymentInfo}
            />
        </div>
    )
}
