
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing Prisma Client...');

    try {
        // 1. Check if we can connect
        await prisma.$connect();
        console.log('Successfully connected to database.');

        // 2. Introspection (Runtime check of available fields is hard but we can try a dry run)
        // We will try to find a product to ensure model is loaded
        const count = await prisma.product.count();
        console.log(`Current product count: ${count}`);

        // 3. Verify if we can "simulate" a creation (this will fail with constraint error if schema is right, or "Unknown arg" if wrong)
        console.log('Attempting dummy creation with new fields...');

        try {
            await prisma.product.create({
                data: {
                    name: "TEST_PRODUCT_SCRIPT",
                    description: "Test",
                    price: 100,
                    stock: 1,
                    images: "[]",
                    storeId: "dummy_id", // This will fail FK constraint, which is GOOD (means code reached DB)
                    // New fields
                    sku: "TEST-SKU-1",
                    salePrice: 90,
                    tags: "test"
                }
            });
        } catch (e: any) {
            if (e.message.includes("Foreign key constraint failed") || e.message.includes("Store")) {
                console.log("✅ SUCCESS: Prisma Client recognized the fields! (Failed on expected FK constraint)");
            } else if (e.message.includes("Unknown argument")) {
                console.error("❌ FAILURE: Prisma Client DOES NOT know about new fields (sku/salePrice).");
                console.error(e.message);
            } else {
                console.log("⚠️ Received unexpected error (might still be success):", e.message);
            }
        }

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
