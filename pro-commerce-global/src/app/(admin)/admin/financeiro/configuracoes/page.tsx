import { prisma } from "@/lib/prisma"
import FinanceSettingsForm from "@/components/admin/finance/FinanceSettingsForm"

export default async function AdminFinanceSettingsPage() {
    const config = await prisma.systemConfig.upsert({
        where: { id: "global" },
        update: {},
        create: {
            id: "global",
            appName: "ProCommerce Global"
        }
    })

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Configurações Financeiras</h1>
            <FinanceSettingsForm
                initialData={{
                    vendorRegistrationFee: Number(config.vendorRegistrationFee),
                    platformFeePercent: Number(config.platformFeePercent),
                    withdrawalFeePercent: Number(config.withdrawalFeePercent || 1), // Fallback if schema update failed temporarily
                    adminPaymentInfo: config.adminPaymentInfo
                }}
            />
        </div>
    )
}
