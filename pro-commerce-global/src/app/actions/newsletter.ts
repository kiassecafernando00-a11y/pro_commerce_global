"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const schema = z.object({
    email: z.string().email(),
})

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
    const email = formData.get("email") as string

    const result = schema.safeParse({ email })

    if (!result.success) {
        return { message: "Por favor, insira um email válido.", type: "error" }
    }

    try {
        const existing = await prisma.newsletterSubscriber.findUnique({
            where: { email },
        })

        if (existing) {
            if (!existing.isActive) {
                await prisma.newsletterSubscriber.update({
                    where: { email },
                    data: { isActive: true }
                })
                return { message: "Bem-vindo de volta! A sua subscrição foi reativada.", type: "success" }
            }
            return { message: "Este email já está subscrito.", type: "info" }
        }

        await prisma.newsletterSubscriber.create({
            data: { email },
        })

        revalidatePath("/")
        return { message: "Obrigado por subscrever! Novidades em breve.", type: "success" }
    } catch (error) {
        console.error("Newsletter error:", error)
        return { message: "Ocorreu um erro ao subscrever. Tente novamente.", type: "error" }
    }
}
