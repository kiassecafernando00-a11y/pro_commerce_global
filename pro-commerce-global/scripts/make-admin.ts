
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@procommerce.com'
    const password = await bcrypt.hash('Admin123!', 10)

    console.log(`Creating/Updating Admin User: ${email}...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            password
        },
        create: {
            email,
            name: 'Super Admin',
            role: 'ADMIN',
            password,
            nif: '000000000',
            address: 'Headquarters',
            phone: '000000000'
        }
    })

    console.log('✅ User updated/created successfully!')
    console.log('-----------------------------------')
    console.log('Email: admin@procommerce.com')
    console.log('Password: Admin123!')
    console.log('-----------------------------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
