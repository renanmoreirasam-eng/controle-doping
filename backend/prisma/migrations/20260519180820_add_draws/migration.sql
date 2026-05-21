-- CreateEnum
CREATE TYPE "DrawPlayerType" AS ENUM ('EXAME', 'RESERVA');

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawPlayer" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "DrawPlayerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawPlayer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawPlayer" ADD CONSTRAINT "DrawPlayer_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
