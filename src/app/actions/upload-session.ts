"use server"

import { prisma } from "@/lib/prisma"

export async function createUploadSession(documentType: string = "BI") {
    try {
        console.log("Creating Upload Session for Type:", documentType)
        const session = await prisma.uploadSession.create({
            data: {
                status: 'PENDING',
                documentType
            }
        })
        return { success: true, sessionId: session.id }
    } catch (error) {
        console.error("Error creating upload session:", error)
        return { success: false }
    }
}

export async function checkUploadSession(sessionId: string) {
    try {
        const session = await prisma.uploadSession.findUnique({
            where: { id: sessionId }
        })

        if (!session) return { success: false, notFound: true }

        return {
            success: true,
            status: session.status,
            frontImage: session.frontImage,
            backImage: session.backImage,
            documentType: session.documentType
        }
    } catch (error) {
        console.error("Error checking session:", error)
        return { success: false }
    }
}
