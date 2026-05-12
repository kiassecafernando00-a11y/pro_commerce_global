const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createUsers() {
    console.log('👥 Criando usuários de teste...\n')

    // 1. Admin User
    const adminEmail = 'admin@procommerce.com'
    const adminPassword = 'admin123'

    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })

    if (!admin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Administrador',
                role: 'ADMIN',
                isActive: true
            }
        })
        console.log(`✅ Admin criado: ${adminEmail} / ${adminPassword}`)
    } else {
        console.log(`ℹ️  Admin já existe: ${adminEmail}`)
    }

    // 2. Test Vendor (seu email)
    const vendorEmail = 'kiassecafernando00@gmail.com'
    const vendorPassword = 'senha123'

    let vendor = await prisma.user.findUnique({ where: { email: vendorEmail } })

    if (!vendor) {
        const hashedPassword = await bcrypt.hash(vendorPassword, 10)
        vendor = await prisma.user.create({
            data: {
                email: vendorEmail,
                password: hashedPassword,
                name: 'Fernando Kiasseca',
                role: 'VENDOR',
                isActive: true,
                nif: '123456789',
                phone: '+244 900 000 000',
                address: 'Luanda',
                city: 'Luanda',
                country: 'Angola'
            }
        })

        // Create store for vendor
        await prisma.store.create({
            data: {
                userId: vendor.id,
                name: 'Loja Teste',
                description: 'Loja de demonstração',
                status: 'APPROVED',
                isPaid: true
            }
        })

        console.log(`✅ Vendedor criado: ${vendorEmail} / ${vendorPassword}`)
        console.log(`✅ Loja criada e aprovada`)
    } else {
        console.log(`ℹ️  Vendedor já existe: ${vendorEmail}`)
        // Update password in case it was wrong
        const hashedPassword = await bcrypt.hash(vendorPassword, 10)
        await prisma.user.update({
            where: { id: vendor.id },
            data: { password: hashedPassword }
        })
        console.log(`✅ Senha atualizada: ${vendorPassword}`)
    }

    // 3. Test Customer
    const customerEmail = 'cliente@test.com'
    const customerPassword = 'cliente123'

    let customer = await prisma.user.findUnique({ where: { email: customerEmail } })

    if (!customer) {
        const hashedPassword = await bcrypt.hash(customerPassword, 10)
        await prisma.user.create({
            data: {
                email: customerEmail,
                password: hashedPassword,
                name: 'Cliente Teste',
                role: 'CUSTOMER',
                isActive: true
            }
        })
        console.log(`✅ Cliente criado: ${customerEmail} / ${customerPassword}`)
    } else {
        console.log(`ℹ️  Cliente já existe: ${customerEmail}`)
    }

    console.log('\n📝 CREDENCIAIS DE LOGIN:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔐 ADMIN:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Senha: ${adminPassword}`)
    console.log('')
    console.log('👤 VENDEDOR (seu email):')
    console.log(`   Email: ${vendorEmail}`)
    console.log(`   Senha: ${vendorPassword}`)
    console.log('')
    console.log('🛍️  CLIENTE:')
    console.log(`   Email: ${customerEmail}`)
    console.log(`   Senha: ${customerPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

createUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
