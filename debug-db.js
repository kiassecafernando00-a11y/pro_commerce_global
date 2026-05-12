
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
})

async function main() {
    try {
        console.log('Attempting to connect to database...')
        await prisma.$connect()
        console.log('Connected successfully.')

        console.log('Running query: SELECT 1')
        const result = await prisma.$queryRaw`SELECT 1`
        console.log('Query Result:', result)

        const count = await prisma.user.count()
        console.log('User count:', count)

    } catch (e) {
        console.error('CONNECTION ERROR:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
