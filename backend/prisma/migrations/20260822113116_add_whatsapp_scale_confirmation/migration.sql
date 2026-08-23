/*
  Warnings:

  - A unique constraint covering the columns `[confirmationTokenHash]` on the table `MatchOfficial` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MatchOfficial" ADD COLUMN     "confirmationTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationTokenHash" TEXT,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "responseMethod" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MatchOfficial_confirmationTokenHash_key" ON "MatchOfficial"("confirmationTokenHash");
