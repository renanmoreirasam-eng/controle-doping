-- CreateTable
CREATE TABLE "UserUnavailability" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserUnavailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserUnavailability_date_idx" ON "UserUnavailability"("date");

-- CreateIndex
CREATE INDEX "UserUnavailability_userId_idx" ON "UserUnavailability"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserUnavailability_userId_date_key" ON "UserUnavailability"("userId", "date");

-- AddForeignKey
ALTER TABLE "UserUnavailability" ADD CONSTRAINT "UserUnavailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
