import crypto from 'crypto'

/**
 * Generates a SHA-256 hash for a given object or string.
 * This is used to sign transactions and verify integrity.
 */
export function generateHash(data: any): string {
    const str = typeof data === 'string' ? data : JSON.stringify(data, Object.keys(data).sort())
    return crypto.createHash('sha256').update(str).digest('hex')
}

/**
 * Verifies if the hash matches the data.
 */
export function verifyHash(data: any, hash: string): boolean {
    return generateHash(data) === hash
}

/**
 * Generates a unique transaction signature.
 * Combines critical fields + previous hash for chaining.
 */
export function generateTransactionSignature(
    payload: {
        type: string
        amount: number | string
        currency: string
        walletId?: string | null
        orderId?: string | null
        userId?: string | null
        storeId?: string | null
    },
    previousHash: string | null
): string {
    // Sort keys implicitly by picking them manually to ensure consistency
    const signaturePayload = {
        prev: previousHash || "GENESIS",
        type: payload.type,
        amount: payload.amount.toString(),
        currency: payload.currency,
        walletId: payload.walletId || "",
        orderId: payload.orderId || "",
        storeId: payload.storeId || ""
    }

    return generateHash(signaturePayload)
}
