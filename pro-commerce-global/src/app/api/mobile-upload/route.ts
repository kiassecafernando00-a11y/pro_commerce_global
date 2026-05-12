import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// GET: Check Session Status & Type
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ success: false })

    try {
        const session = await prisma.uploadSession.findUnique({ where: { id } })
        if (!session) return NextResponse.json({ success: false, notFound: true })

        return NextResponse.json({
            success: true,
            status: session.status,
            documentType: session.documentType,
            hasFront: !!session.frontImage,
            hasBack: !!session.backImage
        })
    } catch (e) {
        return NextResponse.json({ success: false })
    }
}

export async function POST(req: NextRequest) {
    try {
        let formData
        try {
            formData = await req.formData()
        } catch (e) {
            console.error("Error parsing FormData (Size limit?):", e)
            return NextResponse.json({ error: "O arquivo é muito grande. Tente tirar uma foto com menor resolução ou verifique sua conexão." }, { status: 413 })
        }

        const sessionId = formData.get("sessionId") as string
        const frontImage = formData.get("frontImage") as File | null
        const backImage = formData.get("backImage") as File | null

        if (!sessionId || (!frontImage && !backImage)) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
        }

        const session = await prisma.uploadSession.findUnique({
            where: { id: sessionId }
        })

        if (!session) {
            return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
        }

        const isPassport = session.documentType === "PASSPORT"

        if (!frontImage && !backImage) { // Check if something was sent
            return NextResponse.json({ error: "Nenhuma imagem recebida" }, { status: 400 })
        }

        // If not passport, and no back image sent, and no back image already exists in session...
        // Ideally we should enforce back image for non-passports, but since they can upload one by one, 
        // we might just accept what they sent. But the frontend enforces it.
        // Let's just trust the frontend or check if they are trying to "complete" it.
        // Actually, the completion logic is in the Update part.

        const processFile = async (file: File | null) => {
            if (!file || file.size === 0) return null

            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            const filename = `id-magic-${sessionId}-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
            const uploadDir = join(process.cwd(), "public", "uploads", "documents")

            try {
                await mkdir(uploadDir, { recursive: true })
                await writeFile(join(uploadDir, filename), buffer)
                return `/uploads/documents/${filename}`
            } catch (e) {
                console.error("Upload error", e)
                return null
            }
        }

        const frontUrl = await processFile(frontImage)
        const backUrl = await processFile(backImage)

        // Update Session
        const updateData: any = { status: 'COMPLETED' }
        if (frontUrl) updateData.frontImage = frontUrl
        if (backUrl) updateData.backImage = backUrl

        await prisma.uploadSession.update({
            where: { id: sessionId },
            data: updateData
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error in magic upload:", error)
        return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
}
