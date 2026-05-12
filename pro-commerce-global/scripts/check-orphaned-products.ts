import { prisma } from "../src/lib/prisma"

async function main() {
    const orphaned = await prisma.product.findMany({
        where: { storeId: { equals: "missing" } } // Dummy check, improved below
    })

    // Proper check
    const allProducts = await prisma.product.findMany({
        include: { store: true }
    })

    const orphans = allProducts.filter(p => !p.store)
    console.log(`Total Products: ${allProducts.length}`)
    console.log(`Orphaned Products: ${orphans.length}`)

    if (orphans.length > 0) {
        console.log("Orphans:", orphans.map(p => p.name))

        // Fix: Assign to first found store or create a default one
        const firstStore = await prisma.store.findFirst()
        if (firstStore) {
            console.log(`Assigning orphans to store: ${firstStore.name}`)
            await prisma.product.updateMany({
                where: { id: { in: orphans.map(p => p.id) } },
                data: { storeId: firstStore.id }
            })
            console.log("Fixed orphans.")
        } else {
            console.log("No store found to assign orphans to.")
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
