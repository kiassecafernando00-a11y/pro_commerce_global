const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixLogin() {
    const email = 'kiassecafernando00@gmail.com'
    const password = 'senha123' // Senha padrão para reset

    console.log(`🔍 Verificando usuário: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('❌ Usuário não encontrado!')
        console.log('📋 Usuários existentes:')
        const users = await prisma.user.findMany({
            select: { email: true, role: true, isActive: true }
        })
        users.forEach(u => console.log(`   - ${u.email} (${u.role}) ${u.isActive ? '✅' : '❌'}`))
        return
    }

    console.log(`✅ Usuário encontrado: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Active: ${user.isActive}`)
    console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`)

    if (!user.password) {
        console.log('⚠️  Usuário sem senha! Criando senha...')
        const hashedPassword = await bcrypt.hash(password, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        })
        console.log(`✅ Senha criada: ${password}`)
    } else {
        // Verificar se a senha atual funciona
        const testPasswords = ['senha123', 'password', '123456', 'admin123']
        let passwordWorks = false

        for (const testPass of testPasswords) {
            const isValid = await bcrypt.compare(testPass, user.password)
            if (isValid) {
                console.log(`✅ Senha atual funciona: ${testPass}`)
                passwordWorks = true
                break
            }
        }

        if (!passwordWorks) {
            console.log('⚠️  Resetando senha para: senha123')
            const hashedPassword = await bcrypt.hash(password, 10)
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            })
            console.log('✅ Senha resetada!')
        }
    }

    console.log('\n📝 Credenciais de Login:')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)
}

fixLogin()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
