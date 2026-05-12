import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return new NextResponse("No file uploaded", { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Validate file type based on extension/MIME (Basic check)
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
        if (!validTypes.includes(file.type)) {
            return new NextResponse("Invalid file type", { status: 400 })
        }

        // Create unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`

        // Save to public/uploads
        const uploadDir = join(process.cwd(), "public", "uploads")
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // Ignore error if directory exists (though recursive: true handles this mostly)
        }
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Return public URL
        const fileUrl = `/uploads/${filename}`

        return NextResponse.json({ url: fileUrl })
    } catch (error) {
        console.error("Upload error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
