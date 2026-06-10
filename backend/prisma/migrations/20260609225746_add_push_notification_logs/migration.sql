-- CreateTable
CREATE TABLE "PushNotificationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "userRole" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "url" TEXT,
    "module" TEXT,
    "entityId" TEXT,
    "entityType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "error" TEXT,
    "subscriptionCount" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushNotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PushNotificationLog_userId_idx" ON "PushNotificationLog"("userId");

-- CreateIndex
CREATE INDEX "PushNotificationLog_userEmail_idx" ON "PushNotificationLog"("userEmail");

-- CreateIndex
CREATE INDEX "PushNotificationLog_userRole_idx" ON "PushNotificationLog"("userRole");

-- CreateIndex
CREATE INDEX "PushNotificationLog_status_idx" ON "PushNotificationLog"("status");

-- CreateIndex
CREATE INDEX "PushNotificationLog_module_idx" ON "PushNotificationLog"("module");

-- CreateIndex
CREATE INDEX "PushNotificationLog_sentAt_idx" ON "PushNotificationLog"("sentAt");

-- CreateIndex
CREATE INDEX "PushNotificationLog_createdAt_idx" ON "PushNotificationLog"("createdAt");
