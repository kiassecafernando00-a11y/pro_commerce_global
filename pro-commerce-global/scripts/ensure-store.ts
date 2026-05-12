import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]

    if (!email) {
        console.log("Forneça o email do admin")
        process.exit(1)
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
        console.log("Utilizador não encontrado")
        process.exit(1)
    }

    const existingStore = await prisma.store.findUnique({ where: { userId: user.id } })

    if (existingStore) {
        console.log(`Utilizador já tem loja: ${existingStore.name}`)
    } else {
        console.log("Criando loja para Admin...")
        await prisma.store.create({
            data: {
                name: `Loja Oficial (${user.name})`,
                userId: user.id
            }
        })
        console.log("Loja criada com sucesso!")
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
