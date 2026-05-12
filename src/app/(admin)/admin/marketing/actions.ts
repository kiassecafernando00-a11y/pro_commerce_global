"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// --- Banners ---
export async function createBanner(formData: FormData) {
    const title = formData.get("title") as string
    const imageUrl = formData.get("imageUrl") as string
    const link = formData.get("link") as string

    await prisma.banner.create({
        data: { title, imageUrl, link, isActive: true }
    })
    revalidatePath("/admin/marketing")
}

export async function deleteBanner(id: string) {
    await prisma.banner.delete({ where: { id } })
    revalidatePath("/admin/marketing")
}

export async function toggleBanner(id: string, current: boolean) {
    await prisma.banner.update({ where: { id }, data: { isActive: !current } })
    revalidatePath("/admin/marketing")
}

// --- Campaigns ---
export async function createCampaign(formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const type = formData.get("type") as string // CONTEST, TRAINING, GIVEAWAY
    const prize = formData.get("prize") as string
    const imageUrl = formData.get("imageUrl") as string
    const link = formData.get("link") as string

    // Dates need parsing

    await prisma.campaign.create({
        data: {
            title, description, type, prize, imageUrl, link,
            isActive: true
        }
    })
    revalidatePath("/admin/marketing")
}

export async function deleteCampaign(id: string) {
    await prisma.campaign.delete({ where: { id } })
    revalidatePath("/admin/marketing")
}

export async function toggleCampaign(id: string, current: boolean) {
    await prisma.campaign.update({ where: { id }, data: { isActive: !current } })
    revalidatePath("/admin/marketing")
}
