CREATE TYPE "MediaProvider" AS ENUM ('OSS', 'COS', 'R2');

CREATE TYPE "MediaAssetStatus" AS ENUM ('ACTIVE', 'DELETING', 'DELETE_FAILED');

CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "uploadedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MediaAsset_objectKey_key" ON "MediaAsset"("objectKey");

CREATE UNIQUE INDEX "MediaAsset_publicUrl_key" ON "MediaAsset"("publicUrl");

CREATE INDEX "MediaAsset_status_createdAt_idx" ON "MediaAsset"("status", "createdAt");

CREATE INDEX "MediaAsset_displayName_idx" ON "MediaAsset"("displayName");

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
