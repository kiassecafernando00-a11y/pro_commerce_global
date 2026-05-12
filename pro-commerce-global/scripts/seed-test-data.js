const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedTestData() {
    console.log('🌱 Generating test data...')

    // 1. Get Vendor
    const vendorEmail = 'kiassecafernando00@gmail.com'
    const user = await prisma.user.findUnique({
        where: { email: vendorEmail },
        include: { store: true }
    })

    if (!user) {
        console.error('❌ Vendor not found. Please run create-users.js first.')
        return
    }

    let storeId
    if (!user.store) {
        console.log('⚠️  User has no store. Creating store...')
        const store = await prisma.store.create({
            data: {
                userId: user.id,
                name: 'Loja Teste',
                description: 'Loja criada automaticamente',
                status: 'APPROVED',
                registrationFeeStatus: 'PAID'
            }
        })
        storeId = store.id
        console.log('✅ Store created.')
    } else {
        storeId = user.store.id
        console.log(`✅ Vendor found: ${user.name} (${user.store.name})`)
    }

    // 2. Create Products
    const categories = await prisma.category.findMany()
    if (categories.length === 0) {
        console.error('❌ No categories found. Please run prisma/seed.js first.')
        return
    }

    const productsData = [
        {
            name: 'Smartphone Pro Max 2025',
            description: 'O melhor smartphone do mercado com câmera de 200MP e bateria de longa duração.',
            price: 950000,
            stock: 50,
            images: JSON.stringify(['https://images.unsplash.com/photo-1627565985834-4b5329a1d479?auto=format&fit=crop&q=80']),
            categoryId: categories.find(c => c.slug === 'eletronicos')?.id || categories[0].id
        },
        {
            name: 'Laptop Gamer Ultra',
            description: 'Potência máxima para jogos e trabalho pesado. Processador de última geração.',
            price: 1350000,
            stock: 20,
            images: JSON.stringify(['https://images.unsplash.com/photo-1628169600127-640a3328e7c1?auto=format&fit=crop&q=80']),
            categoryId: categories.find(c => c.slug === 'eletronicos')?.id || categories[0].id
        },
        {
            name: 'Tênis de Corrida Elite',
            description: 'Conforto e performance para seus treinos.',
            price: 45000,
            stock: 100,
            images: JSON.stringify(['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80']),
            categoryId: categories.find(c => c.slug === 'esportes')?.id || categories[0].id
        },
        {
            name: 'Relógio Inteligente Series 9',
            description: 'Monitore sua saúde e notificações com estilo.',
            price: 120000,
            stock: 75,
            images: JSON.stringify(['https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80']),
            categoryId: categories.find(c => c.slug === 'eletronicos')?.id || categories[0].id
        }
    ]

    let productsCreated = 0
    for (const p of productsData) {
        const exists = await prisma.product.findFirst({ where: { name: p.name, storeId } })
        if (!exists) {
            await prisma.product.create({
                data: {
                    ...p,
                    storeId,
                    status: 'ACTIVE'
                }
            })
            productsCreated++
        }
    }
    console.log(`✅ Added ${productsCreated} products`)

    // 3. Credit Wallet
    let wallet = await prisma.wallet.findUnique({ where: { storeId } })
    if (!wallet) {
        wallet = await prisma.wallet.create({ data: { storeId } })
    }

    // Add fake sales transactions
    const salesToAdd = [
        { amount: 50000, desc: 'Venda #1234 - Tênis de Corrida' },
        { amount: 150000, desc: 'Venda #1235 - Relógio Inteligente' },
        { amount: 950000, desc: 'Venda #1236 - Smartphone Pro Max' }
    ]

    let totalCredited = 0
    for (const sale of salesToAdd) {
        // Check if transaction exists (simple check by description to avoid dupes on re-run)
        const exists = await prisma.transaction.findFirst({
            where: { walletId: wallet.id, description: sale.desc }
        })

        if (!exists) {
            await prisma.$transaction(async (tx) => {
                await tx.transaction.create({
                    data: {
                        walletId: wallet.id,
                        type: 'SALE',
                        amount: sale.amount,
                        currency: 'AOA',
                        status: 'COMPLETED',
                        description: sale.desc,
                        storeId
                    }
                })

                await tx.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: { increment: sale.amount } }
                })
            })
            totalCredited += sale.amount
        }
    }

    console.log(`✅ Credited wallet with ${totalCredited.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`)

    // Final Stats
    const finalWallet = await prisma.wallet.findUnique({ where: { id: wallet.id } })
    console.log('\n📊 STATUS ATUAL:')
    console.log(`   Produtos: ${await prisma.product.count({ where: { storeId } })}`)
    console.log(`   Saldo Disponível: ${Number(finalWallet.balance).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`)
    console.log(`   Saldo Pendente: ${Number(finalWallet.pending).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}`)
}

seedTestData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
