import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3]
    const name = process.argv[4] || "Administrador"

    if (!email || !password) {
        console.log("Uso: npx tsx scripts/create-admin.ts <email> <password> [nome]")
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: 'ADMIN'
            }
        })
        console.log(`Sucesso! Admin criado: ${user.email}`)
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.error("Erro: Este email já existe.")
        } else {
            console.error("Erro ao criar admin:", e)
        }
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
