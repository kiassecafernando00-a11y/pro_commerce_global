'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Schemas
const createEventSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().min(10, "A descrição deve ser mais detalhada"),
    type: z.enum(['GIVEAWAY', 'CONTEST', 'CHALLENGE', 'QUIZ']),
    prizeType: z.enum(['PRODUCT', 'COUPON', 'MONEY', 'OTHER']),
    prizeDescription: z.string().min(1, "Descreva o prémio"),
    prizeValue: z.number().optional(), // For Coupon % or Money Amount
    startDate: z.string(),
    endDate: z.string(),
    imageUrl: z.string().optional(),
    quizQuestion: z.string().optional(),
    correctAnswer: z.string().optional(),
})

const joinEventSchema = z.object({
    eventId: z.string(),
    name: z.string().min(2, "Nome inválido"),
    phone: z.string().min(9, "Telefone inválido"),
    email: z.string().email().optional().or(z.literal('')),
    submissionData: z.string().optional(),
})

// Actions

export async function createEvent(data: z.infer<typeof createEventSchema>) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Não autenticado' }

    // Get store
    const store = await prisma.store.findUnique({
        where: { userId: session.user.id }
    })

    if (!store) return { error: 'Loja não encontrada' }

    if (data.type === 'QUIZ' && (!data.quizQuestion || !data.correctAnswer)) {
        return { error: 'Quiz deve ter pergunta e resposta correta' }
    }

    if ((data.prizeType === 'COUPON' || data.prizeType === 'MONEY') && !data.prizeValue) {
        return { error: 'Defina o valor do prémio' }
    }

    try {
        const event = await prisma.event.create({
            data: {
                storeId: store.id,
                title: data.title,
                description: data.description,
                type: data.type,
                prizeType: data.prizeType,
                prizeDescription: data.prizeDescription,
                prizeValue: data.prizeValue,
                quizQuestion: data.quizQuestion,
                correctAnswer: data.correctAnswer,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                imageUrl: data.imageUrl,
                status: 'ACTIVE'
            }
        })

        revalidatePath('/dashboard/loja/eventos')
        return { success: true, event }
    } catch (error) {
        console.error('Error creating event:', error)
        return { error: 'Falha ao criar evento' }
    }
}

export async function joinEvent(data: z.infer<typeof joinEventSchema>) {
    try {
        // Check if event is active
        const event = await prisma.event.findUnique({
            where: { id: data.eventId }
        })

        if (!event || event.status !== 'ACTIVE' || new Date() > event.endDate) {
            return { error: 'Este evento não está ativo ou já terminou.' }
        }

        // Check if already joined
        const existing = await prisma.eventParticipant.findFirst({
            where: {
                eventId: data.eventId,
                phone: data.phone
            }
        })

        if (existing) {
            return { error: 'Já está a participar neste evento.' }
        }

        // QUIZ VALIDATION
        if (event.type === 'QUIZ') {
            if (!data.submissionData) {
                return { error: 'Por favor, responda à pergunta do Quiz.' }
            }
            // Simple string comparison, case-insensitive
            if (data.submissionData.trim().toLowerCase() !== event.correctAnswer?.trim().toLowerCase()) {
                return { error: 'Resposta incorreta. Tente novamente!' }
            }
        }

        const participant = await prisma.eventParticipant.create({
            data: {
                eventId: data.eventId,
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                submissionData: data.submissionData
            }
        })

        return { success: true, participant }
    } catch (error) {
        console.error('Error joining event:', error)
        return { error: 'Falha ao participar no evento' }
    }
}

export async function pickWinner(eventId: string, participantId?: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: 'Não autenticado' }

    // Verify ownership
    const store = await prisma.store.findUnique({
        where: { userId: session.user.id }
    })

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    })

    if (!store || !event || event.storeId !== store.id) {
        return { error: 'Não autorizado' }
    }

    try {
        let winnerId = participantId

        if (!winnerId) {
            // Random pick from those who haven't won yet
            const participants = await prisma.eventParticipant.findMany({
                where: { eventId, hasWon: false }
            })

            if (participants.length === 0) return { error: 'Sem participantes elegíveis' }

            const winner = participants[Math.floor(Math.random() * participants.length)]
            winnerId = winner.id
        }

        // Update winner
        const winner = await prisma.eventParticipant.update({
            where: { id: winnerId },
            data: { hasWon: true }
        })

        // AUTO-GENERATE COUPON
        if (event.prizeType === 'COUPON' && event.prizeValue) {
            const code = `WIN-${store.name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
            await prisma.coupon.create({
                data: {
                    code: code,
                    description: `Prémio do evento: ${event.title}`,
                    discountType: 'PERCENTAGE', // Assuming percentage for now, or could inferred
                    discountValue: event.prizeValue,
                    storeId: store.id,
                    maxUses: 1, // Winner only
                    startDate: new Date(),
                    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Valid for 1 month
                }
            })
            console.log(`Coupon generated for winner: ${code}`);
            // Simulate SMS: `Parabéns ${winner.name}! Ganhou um cupom de ${event.prizeValue}% na loja ${store.name}. Código: ${code}`
        }

        // Update event status to ENDED if specifically picking a final winner
        // Or keep it active if multiples? User said "ao vencer um desses eventos". Usually implies one winner closes it, or resets?
        // User said "tão logo o sistema constatar que alguem venceu automaticamente o sistema enviara a mensagem".
        // I will set status to ENDED to be safe.

        await prisma.event.update({
            where: { id: eventId },
            data: { status: 'ENDED' }
        })

        // TODO: Message sending logic will be handled by a notification service or simulated here
        // "O sistema enviara a mensagem ou via sms ou via whatsapp"

        revalidatePath(`/dashboard/loja/eventos/${eventId}`)
        return { success: true, winner }
    } catch (error) {
        console.error('Error picking winner:', error)
        return { error: 'Falha ao selecionar vencedor' }
    }
}

export async function getActiveEventsForHome() {
    try {
        const events = await prisma.event.findMany({
            where: {
                status: 'ACTIVE',
                endDate: { gt: new Date() }
            },
            take: 3,
            orderBy: { endDate: 'asc' },
            include: { store: { select: { name: true } } }
        })

        const recentWinners = await prisma.eventParticipant.findMany({
            where: { hasWon: true },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: { event: { select: { title: true } } }
        })

        return { events, recentWinners }
    } catch (error) {
        console.error('Error fetching home events:', error)
        return { events: [], recentWinners: [] }
    }
}
