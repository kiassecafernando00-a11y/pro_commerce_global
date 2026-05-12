import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        console.log("📝 FormData recebido")

        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const role = formData.get("role") as string

        // Vendor Fields
        const vendorType = formData.get("vendorType") as string
        // Personal Data
        const personalPhone = formData.get("phone") as string
        const birthDate = formData.get("birthDate") as string
        const personalAddress = formData.get("personalAddress") as string
        const idDocumentType = formData.get("idDocumentType") as string
        const idDocumentNumber = formData.get("idDocumentNumber") as string

        // Business Data
        const storeName = formData.get("storeName") as string
        const businessNif = formData.get("businessNif") as string
        const businessEmail = formData.get("businessEmail") as string
        const businessPhone = formData.get("businessPhone") as string
        const businessAddress = formData.get("businessAddress") as string
        const country = formData.get("country") as string

        // Validações Básicas
        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: "Todos os campos obrigatórios devem ser preenchidos" },
                { status: 400 }
            )
        }

        if (!["CUSTOMER", "VENDOR"].includes(role)) {
            return NextResponse.json({ error: "Tipo de conta inválido" }, { status: 400 })
        }

        // Verificar se email existe
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            return NextResponse.json({ error: "Este email já está registado" }, { status: 400 })
        }

        // Handle File Upload if Vendor
        let idDocumentImageUrl = null
        let idDocumentImageBackUrl = null

        if (role === "VENDOR") {
            const processFile = async (file: File | null) => {
                if (!file || file.size === 0) return null

                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
                if (!validTypes.includes(file.type)) return null

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)
                const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
                const filename = `id-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
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

            // Process both files
            const idDocumentFile = formData.get("idDocumentFile") as File | null
            const idDocumentFileBack = formData.get("idDocumentFileBack") as File | null

            // Magic URLs (Already uploaded)
            const magicFrontUrl = formData.get("magicFrontUrl") as string | null
            const magicBackUrl = formData.get("magicBackUrl") as string | null

            idDocumentImageUrl = magicFrontUrl || await processFile(idDocumentFile)
            idDocumentImageBackUrl = magicBackUrl || await processFile(idDocumentFileBack)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Criar Utilizador (Personal Data)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                // Personal Vendor Fields
                phone: personalPhone || undefined,
                birthDate: birthDate ? new Date(birthDate) : undefined,
                address: personalAddress || undefined,
                country: country || undefined, // Personal Nationality (or Business?) - keeping consistent with old
                idDocumentType: idDocumentType || undefined,
                idDocumentNumber: idDocumentNumber || undefined,
                idDocumentImage: idDocumentImageUrl,
                idDocumentImageBack: idDocumentImageBackUrl,
            },
        })

        // Store (Business Data)
        if (role === "VENDOR") {
            await prisma.store.create({
                data: {
                    name: storeName || `${name}'s Store`,
                    userId: user.id,
                    vendorType: vendorType || "NATIONAL",
                    status: 'PENDING',
                    // Business Data
                    nif: businessNif,
                    phone: businessPhone,
                    email: businessEmail,
                    address: businessAddress,
                    registrationFeeStatus: "PENDING"
                },
            })
        }

        return NextResponse.json(
            { message: "Conta criada com sucesso", userId: user.id },
            { status: 201 }
        )

    } catch (error) {
        console.error("Erro ao registar:", error)
        return NextResponse.json(
            // @ts-ignore
            { error: error?.message || "Erro interno ao criar conta" },
            { status: 500 }
        )
    }
}
