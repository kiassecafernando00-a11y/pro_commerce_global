'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const categorySchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().default(true)
})

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    // Basic slug generation
    const slug = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, "") // trim dashes

    try {
        const validated = categorySchema.parse({
            name,
            description
        })

        await prisma.category.create({
            data: {
                ...validated,
                slug
            }
        })

        revalidatePath("/admin/categorias")
        return { success: true, message: "Categoria criada com sucesso!" }
    } catch (error) {
        console.error("Failed to create category:", error)
        return { success: false, message: "Erro ao criar categoria. Verifique se o nome já existe." }
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        })
        revalidatePath("/admin/categorias")
        return { success: true, message: "Categoria removida." }
    } catch (error) {
        return { success: false, message: "Erro ao remover categoria." }
    }
}

export async function toggleCategoryStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.category.update({
            where: { id },
            data: { isActive: !currentStatus }
        })
        revalidatePath("/admin/categorias")
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}
