import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]

    if (!email) {
        console.log("Por favor forneça um email.")
        process.exit(1)
    }

    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    })

    console.log(`Sucesso! Utilizador ${user.email} agora é ADMIN.`)
}

main()
    .catch((e) => {
        console.error("Erro ou utilizador não encontrado:", e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
