-- CreateTable
CREATE TABLE "PlatformStats" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "component" TEXT,
    "action" TEXT,
    "status" TEXT,
    "duration" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "stackTrace" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformStats_timestamp_idx" ON "PlatformStats"("timestamp");

-- CreateIndex
CREATE INDEX "PlatformStats_eventType_idx" ON "PlatformStats"("eventType");

-- CreateIndex
CREATE INDEX "PlatformStats_severity_idx" ON "PlatformStats"("severity");
