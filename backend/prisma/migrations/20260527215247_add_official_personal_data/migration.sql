-- AlterTable
ALTER TABLE "Official" ADD COLUMN     "address" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "documentType" TEXT,
ADD COLUMN     "operationalRole" TEXT,
ADD COLUMN     "personalDataUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "shirtSize" TEXT;
