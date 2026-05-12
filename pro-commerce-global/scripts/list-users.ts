import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    })

    console.log("--- UTILIZADORES ---")
    if (users.length === 0) {
        console.log("Nenhum utilizador encontrado.")
    } else {
        users.forEach(u => {
            console.log(`${u.email} | ${u.name} | ${u.role}`)
        })
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
