-- CreateEnum
CREATE TYPE "KitStatus" AS ENUM ('DISPONIVEL', 'COM_DCO', 'VINCULADO_JOGO', 'UTILIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "KitMovementType" AS ENUM ('ENTRADA_ESTOQUE', 'REPASSE_DCO', 'VINCULO_JOGO', 'UTILIZADO', 'CANCELADO', 'DEVOLUCAO_ESTOQUE');

-- CreateTable
CREATE TABLE "Kit" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "KitStatus" NOT NULL DEFAULT 'DISPONIVEL',
    "currentOfficialId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchKit" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "officialId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "MatchKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KitMovement" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "type" "KitMovementType" NOT NULL,
    "fromOfficialId" TEXT,
    "toOfficialId" TEXT,
    "matchId" TEXT,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KitMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kit_number_key" ON "Kit"("number");

-- CreateIndex
CREATE UNIQUE INDEX "MatchKit_matchId_kitId_key" ON "MatchKit"("matchId", "kitId");

-- AddForeignKey
ALTER TABLE "Kit" ADD CONSTRAINT "Kit_currentOfficialId_fkey" FOREIGN KEY ("currentOfficialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchKit" ADD CONSTRAINT "MatchKit_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchKit" ADD CONSTRAINT "MatchKit_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchKit" ADD CONSTRAINT "MatchKit_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Official"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitMovement" ADD CONSTRAINT "KitMovement_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "Kit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitMovement" ADD CONSTRAINT "KitMovement_fromOfficialId_fkey" FOREIGN KEY ("fromOfficialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitMovement" ADD CONSTRAINT "KitMovement_toOfficialId_fkey" FOREIGN KEY ("toOfficialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KitMovement" ADD CONSTRAINT "KitMovement_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
