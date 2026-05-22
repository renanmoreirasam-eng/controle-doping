-- CreateEnum
CREATE TYPE "OperationalStep" AS ENUM ('CHECKIN_STADIUM', 'MATCH_IN_PROGRESS', 'DRAW_DONE', 'CONTROL_DONE');

-- CreateTable
CREATE TABLE "MatchOperationalLog" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "step" "OperationalStep" NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchOperationalLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MatchOperationalLog" ADD CONSTRAINT "MatchOperationalLog_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
