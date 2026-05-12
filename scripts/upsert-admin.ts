import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    const password = process.argv[3]

    if (!email || !password) {
        console.log("Erro: Email e senha necessários.")
        process.exit(1)
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Tenta encontrar para decidir se cria ou atualiza (upsert não funciona bem se pswd for opcional ou diferente)
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
        console.log(`Utilizador ${email} já existe. Atualizando para ADMIN e definindo nova senha...`)
        await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                password: hashedPassword
            }
        })
        console.log("Utilizador atualizado com sucesso!")
    } else {
        console.log(`Criando novo Administrador ${email}...`)
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: "Admin System",
                role: 'ADMIN'
            }
        })
        console.log("Novo Admin criado com sucesso!")
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
