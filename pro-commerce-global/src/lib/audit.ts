import { prisma } from "@/lib/prisma"

export async function createAuditLog(
    actorEmail: string,
    action: string,
    resource: string,
    details: any
) {
    try {
        await prisma.auditLog.create({
            data: {
                actorEmail,
                action: `${action} ON ${resource}`,
                details: typeof details === 'string' ? details : JSON.stringify(details),
                ipAddress: "System" // Could be enriched with headers if passed
            }
        })
    } catch (e) {
        console.error("Failed to write audit log", e)
    }
}
