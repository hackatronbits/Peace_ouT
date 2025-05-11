-- CreateTable
CREATE TABLE "FeatureUsage" (
    "id" SERIAL NOT NULL,
    "featureName" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventMetadata" JSONB,
    "userIdentifier" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeatureUsage_featureName_idx" ON "FeatureUsage"("featureName");

-- CreateIndex
CREATE INDEX "FeatureUsage_eventType_idx" ON "FeatureUsage"("eventType");

-- CreateIndex
CREATE INDEX "FeatureUsage_occurredAt_idx" ON "FeatureUsage"("occurredAt");
