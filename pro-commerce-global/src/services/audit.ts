import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"

export type AuditSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

interface LogParams {
    action: string
    actorEmail?: string | null
    actorId?: string
    entityId?: string
    entityType?: string
    details?: string
    oldData?: any
    newData?: any
    metadata?: any
    severity?: AuditSeverity
}

export const AuditService = {
    /**
     * Records an action in the immutable audit log.
     */
    async log(params: LogParams) {
        try {
            const headerStore = await headers()
            const ip = headerStore.get("x-forwarded-for") || "unknown"
            const userAgent = headerStore.get("user-agent") || "unknown"

            await prisma.auditLog.create({
                data: {
                    action: params.action,
                    actorEmail: params.actorEmail,
                    actorId: params.actorId,
                    entityId: params.entityId,
                    entityType: params.entityType,
                    details: params.details,
                    oldData: params.oldData ? JSON.stringify(params.oldData) : undefined,
                    newData: params.newData ? JSON.stringify(params.newData) : undefined,
                    metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
                    severity: params.severity || "MEDIUM",
                    ipAddress: ip,
                    userAgent: userAgent
                }
            })
        } catch (error) {
            // Fallback: don't block the app if audit fails, but log to console
            console.error("[AUDIT_FAILURE] Failed to log action:", error)
        }
    }
}
