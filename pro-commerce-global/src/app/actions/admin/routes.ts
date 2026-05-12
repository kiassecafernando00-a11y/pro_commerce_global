"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getRoutes() {
    try {
        const routes = await prisma.deliveryRoute.findMany({
            orderBy: { countryName: 'asc' }
        })
        return { success: true, routes }
    } catch (error) {
        console.error("Error fetching routes:", error)
        return { success: false, error: "Failed to fetch routes" }
    }
}

export async function createRoute(data: {
    countryName: string
    countryCode: string
    carrier: string
    baseDays: number
    maxDays: number
}) {
    try {
        await prisma.deliveryRoute.create({
            data: {
                ...data,
                isActive: true
            }
        })
        revalidatePath('/admin/rotas')
        return { success: true }
    } catch (error) {
        console.error("Error creating route:", error)
        return { success: false, error: "Failed to create route" }
    }
}

export async function updateRoute(id: string, data: {
    countryName?: string
    countryCode?: string
    carrier?: string
    baseDays?: number
    maxDays?: number
    isActive?: boolean
}) {
    try {
        await prisma.deliveryRoute.update({
            where: { id },
            data
        })
        revalidatePath('/admin/rotas')
        return { success: true }
    } catch (error) {
        console.error("Error updating route:", error)
        return { success: false, error: "Failed to update route" }
    }
}

export async function deleteRoute(id: string) {
    try {
        await prisma.deliveryRoute.delete({
            where: { id }
        })
        revalidatePath('/admin/rotas')
        return { success: true }
    } catch (error) {
        console.error("Error deleting route:", error)
        return { success: false, error: "Failed to delete route" }
    }
}
