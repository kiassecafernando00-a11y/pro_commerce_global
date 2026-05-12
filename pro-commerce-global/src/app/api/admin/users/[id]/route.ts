import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/auth"

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.role !== "ADMIN") return new NextResponse("Forbidden", { status: 403 })

        const body = await req.json()
        const { role } = body

        if (!role || !["CUSTOMER", "VENDOR", "ADMIN"].includes(role)) {
            return new NextResponse("Invalid role", { status: 400 })
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: { role }
        })

        // Se promover a VENDOR, verifica se precisa criar Store (opcional, por agora deixamos o fluxo de registro lidar com isso ou criamos vazio)
        // Por simplificação apenas muda a role. O utilizador terá de configurar a loja depois ou o admin cria manualmente?
        // Neste sistema simplificado, mudar para VENDOR permite acesso ao dashboard, onde ele pode ser solicitado a criar a loja se não tiver.

        // Se já tiver store e voltar a CUSTOMER, a loja continua lá mas ele perde acesso. É aceitável.

        return NextResponse.json(user)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
