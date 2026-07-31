-- CreateEnum
CREATE TYPE "ExtraMaterialStockHolderType" AS ENUM ('ESTOQUE', 'DCO');

-- CreateEnum
CREATE TYPE "ExtraMaterialMovementType" AS ENUM ('ENTRADA_ESTOQUE', 'REPASSE_DCO', 'USO_JOGO', 'DEVOLUCAO_ESTOQUE', 'AJUSTE');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "extraMaterialNotes" TEXT,
ADD COLUMN     "extraMaterialRegisteredAt" TIMESTAMP(3),
ADD COLUMN     "extraMaterialRegisteredByEmail" TEXT,
ADD COLUMN     "extraMaterialRegisteredById" TEXT,
ADD COLUMN     "extraMaterialRegisteredByName" TEXT,
ADD COLUMN     "extraMaterialUsed" BOOLEAN;

-- CreateTable
CREATE TABLE "ExtraMaterialItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraMaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraMaterialStock" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "holderType" "ExtraMaterialStockHolderType" NOT NULL DEFAULT 'ESTOQUE',
    "holderKey" TEXT NOT NULL,
    "officialId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraMaterialStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraMaterialMovement" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "type" "ExtraMaterialMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "fromOfficialId" TEXT,
    "toOfficialId" TEXT,
    "matchId" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtraMaterialMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtraMaterialUsage" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "officialId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtraMaterialUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExtraMaterialItem_name_key" ON "ExtraMaterialItem"("name");

-- CreateIndex
CREATE INDEX "ExtraMaterialItem_active_idx" ON "ExtraMaterialItem"("active");

-- CreateIndex
CREATE INDEX "ExtraMaterialItem_name_idx" ON "ExtraMaterialItem"("name");

-- CreateIndex
CREATE INDEX "ExtraMaterialItem_createdAt_idx" ON "ExtraMaterialItem"("createdAt");

-- CreateIndex
CREATE INDEX "ExtraMaterialStock_itemId_idx" ON "ExtraMaterialStock"("itemId");

-- CreateIndex
CREATE INDEX "ExtraMaterialStock_holderType_idx" ON "ExtraMaterialStock"("holderType");

-- CreateIndex
CREATE INDEX "ExtraMaterialStock_holderKey_idx" ON "ExtraMaterialStock"("holderKey");

-- CreateIndex
CREATE INDEX "ExtraMaterialStock_officialId_idx" ON "ExtraMaterialStock"("officialId");

-- CreateIndex
CREATE INDEX "ExtraMaterialStock_quantity_idx" ON "ExtraMaterialStock"("quantity");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraMaterialStock_itemId_holderKey_key" ON "ExtraMaterialStock"("itemId", "holderKey");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_itemId_idx" ON "ExtraMaterialMovement"("itemId");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_type_idx" ON "ExtraMaterialMovement"("type");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_matchId_idx" ON "ExtraMaterialMovement"("matchId");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_fromOfficialId_idx" ON "ExtraMaterialMovement"("fromOfficialId");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_toOfficialId_idx" ON "ExtraMaterialMovement"("toOfficialId");

-- CreateIndex
CREATE INDEX "ExtraMaterialMovement_createdAt_idx" ON "ExtraMaterialMovement"("createdAt");

-- CreateIndex
CREATE INDEX "ExtraMaterialUsage_matchId_idx" ON "ExtraMaterialUsage"("matchId");

-- CreateIndex
CREATE INDEX "ExtraMaterialUsage_itemId_idx" ON "ExtraMaterialUsage"("itemId");

-- CreateIndex
CREATE INDEX "ExtraMaterialUsage_officialId_idx" ON "ExtraMaterialUsage"("officialId");

-- CreateIndex
CREATE INDEX "ExtraMaterialUsage_createdAt_idx" ON "ExtraMaterialUsage"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExtraMaterialUsage_matchId_itemId_officialId_key" ON "ExtraMaterialUsage"("matchId", "itemId", "officialId");

-- AddForeignKey
ALTER TABLE "ExtraMaterialStock" ADD CONSTRAINT "ExtraMaterialStock_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ExtraMaterialItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialStock" ADD CONSTRAINT "ExtraMaterialStock_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialMovement" ADD CONSTRAINT "ExtraMaterialMovement_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ExtraMaterialItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialMovement" ADD CONSTRAINT "ExtraMaterialMovement_fromOfficialId_fkey" FOREIGN KEY ("fromOfficialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialMovement" ADD CONSTRAINT "ExtraMaterialMovement_toOfficialId_fkey" FOREIGN KEY ("toOfficialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialMovement" ADD CONSTRAINT "ExtraMaterialMovement_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialUsage" ADD CONSTRAINT "ExtraMaterialUsage_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialUsage" ADD CONSTRAINT "ExtraMaterialUsage_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ExtraMaterialItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraMaterialUsage" ADD CONSTRAINT "ExtraMaterialUsage_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Official"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
