const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create categories if they don't exist
    const categoryCount = await prisma.category.count()

    if (categoryCount === 0) {
        console.log('Creating categories...')

        const categories = [
            { name: 'Eletrônicos', slug: 'eletronicos', isActive: true },
            { name: 'Moda', slug: 'moda', isActive: true },
            { name: 'Casa e Decoração', slug: 'casa-decoracao', isActive: true },
            { name: 'Esportes', slug: 'esportes', isActive: true },
            { name: 'Livros', slug: 'livros', isActive: true },
            { name: 'Beleza', slug: 'beleza', isActive: true },
            { name: 'Alimentos', slug: 'alimentos', isActive: true },
            { name: 'Brinquedos', slug: 'brinquedos', isActive: true }
        ]

        for (const cat of categories) {
            await prisma.category.create({ data: cat })
            console.log(`✅ Created category: ${cat.name}`)
        }
    } else {
        console.log(`ℹ️  ${categoryCount} categories already exist`)
    }

    // Create SystemConfig if it doesn't exist
    const config = await prisma.systemConfig.findUnique({
        where: { id: 'global' }
    })

    if (!config) {
        console.log('Creating SystemConfig...')
        await prisma.systemConfig.create({
            data: {
                id: 'global',
                platformFeePercent: 5.0,
                vendorRegistrationFee: 5000.0
            }
        })
        console.log('✅ SystemConfig created')
    } else {
        console.log('ℹ️  SystemConfig already exists')
    }

    // Stats
    const stats = {
        categories: await prisma.category.count(),
        products: await prisma.product.count(),
        users: await prisma.user.count(),
        stores: await prisma.store.count()
    }

    console.log('\n📊 Database Stats:')
    console.log(`   Categories: ${stats.categories}`)
    console.log(`   Products: ${stats.products}`)
    console.log(`   Users: ${stats.users}`)
    console.log(`   Stores: ${stats.stores}`)

    console.log('\n✅ Seeding completed!')
}

main()
    .catch((e) => {
        console.error('Error seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
