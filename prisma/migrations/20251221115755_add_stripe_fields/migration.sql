-- AlterTable
ALTER TABLE "Store" ADD COLUMN "stripeAccountId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;
