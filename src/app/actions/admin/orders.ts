"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function addOrderEvent(formData: FormData) {
    const orderId = formData.get("orderId") as string
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string

    if (!orderId || !status || !description) {
        return { success: false, error: "Missing required fields" }
    }

    try {
        // 1. Create the event
        await prisma.orderEvent.create({
            data: {
                orderId,
                status,
                description,
                location: location || "Centro de Distribuição",
            }
        })

        // 2. Update the parent order status if needed (optional logic, keeping simple for now)
        // If the event status implies a main status change (e.g., "DELIVERED"), we could update Order.status here.
        // For now, we update the Order status to match the event status for consistency
        await prisma.order.update({
            where: { id: orderId },
            data: { status: status }
        })

        revalidatePath(`/admin/pedidos/${orderId}`)
        return { success: true }
    } catch (error) {
        console.error("Error adding order event:", error)
        return { success: false, error: "Failed to add event" }
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })
        revalidatePath(`/admin/pedidos/${orderId}`)
        revalidatePath(`/admin/pedidos`)
        return { success: true }
    } catch (error) {
        return { success: false, error: "Failed to update status" }
    }
}
