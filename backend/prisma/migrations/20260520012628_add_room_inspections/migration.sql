-- CreateTable
CREATE TABLE "RoomInspection" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomInspectionItem" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "RoomInspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomInspectionPhoto" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "dataUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomInspectionPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomInspection" ADD CONSTRAINT "RoomInspection_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInspectionItem" ADD CONSTRAINT "RoomInspectionItem_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "RoomInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomInspectionPhoto" ADD CONSTRAINT "RoomInspectionPhoto_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "RoomInspection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
