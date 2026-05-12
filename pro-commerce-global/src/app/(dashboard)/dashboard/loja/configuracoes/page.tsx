import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import VendorSettingsContainer from "@/components/vendor/VendorSettingsContainer"

export default async function VendorSettingsPage() {
    const session = await auth()
    if (!session?.user?.email) {
        redirect('/auth/login')
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { store: { include: { bankAccounts: true } } }
    })

    if (!user?.store) {
        return <div>Loja não encontrada</div>
    }

    // Serializable store data
    const storeData = {
        name: user.store.name,
        description: user.store.description,
        logo: user.store.logo,
        banner: user.store.banner,
        address: user.store.address,
        phone: user.store.phone,
        latitude: user.store.latitude,
        longitude: user.store.longitude,
        deliveryPricePerKm: Number(user.store.deliveryPricePerKm),
        deliveryBaseFee: Number(user.store.deliveryBaseFee),
    }

    return (
        <VendorSettingsContainer
            store={storeData}
            bankAccounts={user.store.bankAccounts}
        />
    )
}
