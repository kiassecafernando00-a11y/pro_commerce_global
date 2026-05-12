import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const mode = searchParams.get("mode")
        const category = searchParams.get("category")
        const query = searchParams.get("q")

        // Modo Vendedor: Exige autenticação e retorna produtos da loja
        if (mode === "vendor") {
            const session = await getServerSession(authOptions)
            if (!session?.user?.id) {
                return new NextResponse("Unauthorized", { status: 401 })
            }

            const store = await prisma.store.findUnique({
                where: { userId: session.user.id }
            })

            if (!store) {
                return NextResponse.json({ products: [] })
            }

            const products = await prisma.product.findMany({
                where: { storeId: store.id },
                orderBy: { createdAt: 'desc' }
            })

            return NextResponse.json(products)
        }

        // Modo Público: Retorna todos os produtos (pode filtrar por categoria e busca)
        const where: any = {}

        if (category && category !== "Todos") {
            if (category && category !== "Todos") {
                // Temporarily disabled Prisma Category lookup due to type sync issue
                /*
                // First try to find by slug or name to get the ID
                const categoryRecord = await prisma.category.findFirst({
                    where: {
                        OR: [
                            { slug: category },
                            { name: category }
                        ]
                    }
                })
    
                if (categoryRecord) {
                    where.categoryId = categoryRecord.id
                } else {
                    // Fallback to legacy string match
                    where.category = category
                }
                */
                where.category = category
            }
        }

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { description: { contains: query } }
            ]
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                store: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                categoryRel: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({ products })

    } catch (error) {
        console.error("[PRODUCTS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "VENDOR" && session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const store = await prisma.store.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!store) {
            return new NextResponse("Store not found", { status: 404 })
        }

        const body = await req.json()
        const { name, description, price, stock, images, category, categoryId, salePrice, sku, tags, isVisible } = body
        const parsedIsVisible = isVisible !== undefined ? isVisible : true

        if (!name || !price) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        let product;
        try {
            console.log("Attempting to create product with data:", JSON.stringify({
                name, sku, salePrice, stock, category, tags
            }, null, 2));

            // Safely handle images (convert array to string if needed)
            let imageString = ""
            if (Array.isArray(images)) {
                imageString = JSON.stringify(images)
            } else if (typeof images === 'string') {
                imageString = images
            }

            // Safe Number Parsing
            const priceFloat = parseFloat(price)
            const salePriceFloat = salePrice ? parseFloat(salePrice) : null
            const stockInt = parseInt(stock) || 0

            if (isNaN(priceFloat)) {
                return new NextResponse("Invalid Price", { status: 400 })
            }

            product = await prisma.product.create({
                data: {
                    name,
                    description: description || "",
                    price: priceFloat,
                    salePrice: (salePriceFloat !== null && !isNaN(salePriceFloat)) ? salePriceFloat : null,
                    stock: stockInt,
                    images: imageString,
                    sku: sku || undefined,
                    tags: tags || undefined,
                    isVisible: parsedIsVisible,
                    category: category || "Outros", // Legacy support
                    storeId: store.id,
                    status: "APPROVED",
                    // Temporarily removed categoryRel to fix Prisma type error
                    // ...(categoryId && { categoryRel: { connect: { id: categoryId } } })
                },
            })
        } catch (dbError) {
            console.error("PRISMA CREATE ERROR:", dbError);
            throw dbError;
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error("[PRODUCTS_POST]", error)
        // Return detailed error for debugging (remove in production)
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        return new NextResponse(`Internal Error: ${errorMessage}`, { status: 500 })
    }
}
