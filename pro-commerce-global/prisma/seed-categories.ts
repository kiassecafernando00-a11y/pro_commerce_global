
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
    {
        name: 'Tecnologia & Eletrónica',
        slug: 'tecnologia',
        description: 'Smartphones, Laptops, Tablets e Gadgets de última geração.',
        image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Moda Feminina',
        slug: 'moda-feminina',
        description: 'Roupas, Sapatos e Acessórios para mulheres.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Moda Masculina',
        slug: 'moda-masculina',
        description: 'Estilo e conforto para homens.',
        image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Casa & Decoração',
        slug: 'casa-decoracao',
        description: 'Móveis, Iluminação e tudo para o seu lar.',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Beleza & Saúde',
        slug: 'beleza-saude',
        description: 'Cuidados pessoais, maquiagem e bem-estar.',
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Esportes & Lazer',
        slug: 'esportes',
        description: 'Equipamentos para treino, camping e atividades ao ar livre.',
        image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Brinquedos & Kids',
        slug: 'brinquedos',
        description: 'Diversão para crianças de todas as idades.',
        image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Automotivo',
        slug: 'automotivo',
        description: 'Peças, acessórios e cuidados para o seu veículo.',
        image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Livros & Papelaria',
        slug: 'livros',
        description: 'Conhecimento, cultura e material de escritório.',
        image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=200&auto=format&fit=crop',
        isActive: true
    },
    {
        name: 'Supermercado',
        slug: 'supermercado',
        description: 'Alimentos, bebidas e essenciais do dia a dia.',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop',
        isActive: true
    }
]

async function main() {
    console.log('🌱 Starting seed...')

    for (const cat of categories) {
        const exists = await prisma.category.findUnique({
            where: { slug: cat.slug }
        })

        if (!exists) {
            await prisma.category.create({
                data: cat
            })
            console.log(`✅ Created category: ${cat.name}`)
        } else {
            console.log(`⏩ Category already exists: ${cat.name}`)
        }
    }

    console.log('✨ Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
