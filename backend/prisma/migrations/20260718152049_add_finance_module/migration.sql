-- CreateEnum
CREATE TYPE "FinancialDirection" AS ENUM ('PAYABLE', 'RECEIVABLE');

-- CreateEnum
CREATE TYPE "FinancialEntryType" AS ENUM ('DCO_FEE', 'ASSISTANT_FEE', 'TRAVEL_EXPENSE', 'CBF_RECEIVABLE', 'EXTRA_EXPENSE', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "FinancialStatus" AS ENUM ('SCHEDULED', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELED', 'UNDER_REVIEW', 'REVERSED');

-- CreateTable
CREATE TABLE "PaymentRate" (
    "id" TEXT NOT NULL,
    "stadiumId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "dcoFee" DECIMAL(10,2) NOT NULL,
    "assistantFee" DECIMAL(10,2) NOT NULL,
    "travelExpense" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialEntry" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "officialId" TEXT,
    "direction" "FinancialDirection" NOT NULL,
    "type" "FinancialEntryType" NOT NULL,
    "status" "FinancialStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "settledAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "settledAt" TIMESTAMP(3),
    "paymentMethod" TEXT,
    "transactionReference" TEXT,
    "pixKeyUsed" TEXT,
    "notes" TEXT,
    "rateSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentBatch" (
    "id" TEXT NOT NULL,
    "officialId" TEXT NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'PIX',
    "transactionReference" TEXT,
    "pixKeyUsed" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentBatchItem" (
    "id" TEXT NOT NULL,
    "paymentBatchId" TEXT NOT NULL,
    "financialEntryId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentBatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAttachment" (
    "id" TEXT NOT NULL,
    "financialEntryId" TEXT,
    "paymentBatchId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentRate_stadiumId_idx" ON "PaymentRate"("stadiumId");

-- CreateIndex
CREATE INDEX "PaymentRate_validFrom_idx" ON "PaymentRate"("validFrom");

-- CreateIndex
CREATE INDEX "PaymentRate_active_idx" ON "PaymentRate"("active");

-- CreateIndex
CREATE INDEX "PaymentRate_stadiumId_active_validFrom_idx" ON "PaymentRate"("stadiumId", "active", "validFrom");

-- CreateIndex
CREATE INDEX "FinancialEntry_matchId_idx" ON "FinancialEntry"("matchId");

-- CreateIndex
CREATE INDEX "FinancialEntry_officialId_idx" ON "FinancialEntry"("officialId");

-- CreateIndex
CREATE INDEX "FinancialEntry_direction_idx" ON "FinancialEntry"("direction");

-- CreateIndex
CREATE INDEX "FinancialEntry_status_idx" ON "FinancialEntry"("status");

-- CreateIndex
CREATE INDEX "FinancialEntry_dueDate_idx" ON "FinancialEntry"("dueDate");

-- CreateIndex
CREATE INDEX "FinancialEntry_createdAt_idx" ON "FinancialEntry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialEntry_matchId_officialId_type_key" ON "FinancialEntry"("matchId", "officialId", "type");

-- CreateIndex
CREATE INDEX "PaymentBatch_officialId_idx" ON "PaymentBatch"("officialId");

-- CreateIndex
CREATE INDEX "PaymentBatch_paidAt_idx" ON "PaymentBatch"("paidAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentBatchItem_financialEntryId_key" ON "PaymentBatchItem"("financialEntryId");

-- CreateIndex
CREATE INDEX "PaymentBatchItem_paymentBatchId_idx" ON "PaymentBatchItem"("paymentBatchId");

-- CreateIndex
CREATE INDEX "FinancialAttachment_financialEntryId_idx" ON "FinancialAttachment"("financialEntryId");

-- CreateIndex
CREATE INDEX "FinancialAttachment_paymentBatchId_idx" ON "FinancialAttachment"("paymentBatchId");

-- CreateIndex
CREATE INDEX "FinancialAttachment_createdAt_idx" ON "FinancialAttachment"("createdAt");

-- AddForeignKey
ALTER TABLE "PaymentRate" ADD CONSTRAINT "PaymentRate_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialEntry" ADD CONSTRAINT "FinancialEntry_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Official"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentBatch" ADD CONSTRAINT "PaymentBatch_officialId_fkey" FOREIGN KEY ("officialId") REFERENCES "Official"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentBatchItem" ADD CONSTRAINT "PaymentBatchItem_paymentBatchId_fkey" FOREIGN KEY ("paymentBatchId") REFERENCES "PaymentBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentBatchItem" ADD CONSTRAINT "PaymentBatchItem_financialEntryId_fkey" FOREIGN KEY ("financialEntryId") REFERENCES "FinancialEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAttachment" ADD CONSTRAINT "FinancialAttachment_financialEntryId_fkey" FOREIGN KEY ("financialEntryId") REFERENCES "FinancialEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialAttachment" ADD CONSTRAINT "FinancialAttachment_paymentBatchId_fkey" FOREIGN KEY ("paymentBatchId") REFERENCES "PaymentBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
