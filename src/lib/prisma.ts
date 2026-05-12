import { PrismaClient } from '@prisma/client'
import { generateTransactionSignature } from './security'

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        query: {
            transaction: {
                async create({ args, query }) {
                    // Auto-Hashing Logic
                    const lastTx = await new PrismaClient().transaction.findFirst({
                        orderBy: { createdAt: 'desc' },
                        select: { hash: true }
                    })

                    const previousHash = lastTx?.hash || "GENESIS_BLOCK_HASH"

                    const payload = {
                        type: args.data.type,
                        amount: args.data.amount,
                        currency: args.data.currency,
                        walletId: args.data.walletId,
                        orderId: args.data.orderId,
                        userId: args.data.userId,
                        storeId: args.data.storeId
                    }

                    const signature = generateTransactionSignature(payload as any, previousHash)

                    args.data.hash = signature
                    args.data.previousHash = previousHash

                    return query(args)
                },
                async update({ args, query }) {
                    // Immutability Logic
                    const data = args.data as any
                    if (data.amount || data.currency || data.hash || data.previousHash) {
                        throw new Error(`SECURITY VIOLATION: Immutable fields in Transaction cannot be modified.`);
                    }
                    return query(args)
                },
                async delete({ args, query }) {
                    throw new Error(`SECURITY VIOLATION: Deletion of Transaction is strictly prohibited.`);
                },
                async deleteMany({ args, query }) {
                    throw new Error(`SECURITY VIOLATION: Deletion of Transaction is strictly prohibited.`);
                }
            },
            auditLog: {
                async delete({ args, query }) {
                    throw new Error(`SECURITY VIOLATION: Deletion of AuditLog is strictly prohibited.`);
                },
                async deleteMany({ args, query }) {
                    throw new Error(`SECURITY VIOLATION: Deletion of AuditLog is strictly prohibited.`);
                },
                async update({ args, query }) {
                    throw new Error(`SECURITY VIOLATION: Modification of AuditLog is strictly prohibited.`);
                }
            }
        }
    })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
