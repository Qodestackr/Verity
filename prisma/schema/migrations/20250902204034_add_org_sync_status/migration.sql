-- CreateTable
CREATE TABLE "public"."organization_sync_status" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "channelSlug" TEXT NOT NULL,
    "bootstrapDetected" BOOLEAN NOT NULL DEFAULT false,
    "bootstrapDetectedAt" TIMESTAMP(3),
    "bootstrapFailed" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "lastSyncAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_sync_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_sync_status_organizationId_channelSlug_key" ON "public"."organization_sync_status"("organizationId", "channelSlug");

-- AddForeignKey
ALTER TABLE "public"."organization_sync_status" ADD CONSTRAINT "organization_sync_status_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "public"."Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
