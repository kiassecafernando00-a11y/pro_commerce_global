import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const stores = await prisma.store.findMany({
        include: { user: true }
    })

    console.log("--- LOJAS ---")
    stores.forEach(s => {
        console.log(`Loja: ${s.name} | Dono: ${s.user.email} (${s.user.role})`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
