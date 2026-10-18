-- LocEasy schema alignment for databases created from the previous Prisma schema.
-- This repository has no Prisma migration history, so first confirm that the
-- live schema matches the previous schema in Git and take a database backup.
-- Do not apply this to a new or otherwise different database.
-- This file is intentionally not run by the application or by this change.
-- It only adds schema objects and fills newly-added status fields; it does not
-- delete tables, columns, rows, or enum values.

BEGIN;

DO $$
BEGIN
  IF to_regclass('"User"') IS NULL
     OR to_regclass('"Listing"') IS NULL
     OR to_regclass('"Booking"') IS NULL
     OR to_regclass('"Payment"') IS NULL
     OR to_regclass('"Message"') IS NULL THEN
    RAISE EXCEPTION 'LocEasy baseline tables are missing; inspect the live schema before applying this alignment.';
  END IF;

  IF to_regtype('"PaymentMethod"') IS NULL THEN
    RAISE EXCEPTION 'PaymentMethod enum is missing; inspect the live schema before applying this alignment.';
  END IF;
END $$;

DO $$ BEGIN
  CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReportType" AS ENUM ('user', 'listing', 'message');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "ListingStatus" AS ENUM ('available', 'viewing_in_progress', 'reserved', 'rented');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'yas_togo';
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'moov_togo';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "badge" TEXT,
  ADD COLUMN IF NOT EXISTS "phoneOtp" TEXT,
  ADD COLUMN IF NOT EXISTS "phoneOtpExpires" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "phoneVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "responseRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "responseTime" INTEGER,
  ADD COLUMN IF NOT EXISTS "totalBookings" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalListings" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "verificationDocType" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationRejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "verificationReviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "verificationSubmittedAt" TIMESTAMP(3);

ALTER TABLE "Listing"
  ADD COLUMN IF NOT EXISTS "status" "ListingStatus" NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS "verificationDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "PaymentLink" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'XOF',
  "feexpayId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Report" (
  "id" TEXT NOT NULL,
  "type" "ReportType" NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT,
  "status" "ReportStatus" NOT NULL DEFAULT 'pending',
  "reporterId" TEXT NOT NULL,
  "targetUserId" TEXT,
  "targetListingId" TEXT,
  "targetMessageId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedBy" TEXT,
  "resolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentLink_bookingId_key" ON "PaymentLink"("bookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "PaymentLink_feexpayId_key" ON "PaymentLink"("feexpayId");
CREATE INDEX IF NOT EXISTS "PaymentLink_status_idx" ON "PaymentLink"("status");
CREATE INDEX IF NOT EXISTS "PaymentLink_expiresAt_idx" ON "PaymentLink"("expiresAt");
CREATE INDEX IF NOT EXISTS "Report_type_idx" ON "Report"("type");
CREATE INDEX IF NOT EXISTS "Report_status_idx" ON "Report"("status");
CREATE INDEX IF NOT EXISTS "Report_reporterId_idx" ON "Report"("reporterId");
CREATE INDEX IF NOT EXISTS "Report_targetUserId_idx" ON "Report"("targetUserId");
CREATE INDEX IF NOT EXISTS "Report_targetListingId_idx" ON "Report"("targetListingId");
CREATE INDEX IF NOT EXISTS "User_verificationStatus_idx" ON "User"("verificationStatus");
CREATE INDEX IF NOT EXISTS "User_trustScore_idx" ON "User"("trustScore");
CREATE INDEX IF NOT EXISTS "Listing_status_idx" ON "Listing"("status");
CREATE INDEX IF NOT EXISTS "Listing_verified_idx" ON "Listing"("verified");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PaymentLink_bookingId_fkey' AND conrelid = '"PaymentLink"'::regclass) THEN
    ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_bookingId_fkey"
      FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Report_reporterId_fkey' AND conrelid = '"Report"'::regclass) THEN
    ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey"
      FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Report_targetUserId_fkey' AND conrelid = '"Report"'::regclass) THEN
    ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey"
      FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Report_targetListingId_fkey' AND conrelid = '"Report"'::regclass) THEN
    ALTER TABLE "Report" ADD CONSTRAINT "Report_targetListingId_fkey"
      FOREIGN KEY ("targetListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Report_targetMessageId_fkey' AND conrelid = '"Report"'::regclass) THEN
    ALTER TABLE "Report" ADD CONSTRAINT "Report_targetMessageId_fkey"
      FOREIGN KEY ("targetMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Retain pre-existing verified accounts in the new verification status field.
UPDATE "User"
SET "verificationStatus" = 'verified'
WHERE "verified" = true AND "verificationStatus" = 'pending';

-- Reconstruct the new listing state from existing booking/payment records.
-- Legacy unavailable listings with no active booking stay hidden as rented.
UPDATE "Listing" AS l
SET "status" = CASE
      WHEN EXISTS (
        SELECT 1 FROM "Booking" AS b
        WHERE b."listingId" = l."id" AND b."status" = 'accepted' AND b."paymentStatus" = 'paid'
      ) THEN 'rented'::"ListingStatus"
      WHEN EXISTS (
        SELECT 1 FROM "Booking" AS b
        WHERE b."listingId" = l."id" AND b."status" = 'accepted'
      ) THEN 'reserved'::"ListingStatus"
      WHEN EXISTS (
        SELECT 1 FROM "Booking" AS b
        WHERE b."listingId" = l."id" AND b."status" = 'pending'
      ) THEN 'viewing_in_progress'::"ListingStatus"
      WHEN l."available" THEN 'available'::"ListingStatus"
      ELSE 'rented'::"ListingStatus"
    END,
    "available" = CASE
      WHEN EXISTS (
        SELECT 1 FROM "Booking" AS b
        WHERE b."listingId" = l."id" AND b."status" IN ('pending', 'accepted')
      ) THEN false
      ELSE l."available"
    END
WHERE l."status" = 'available'
  AND (
    NOT l."available"
    OR EXISTS (
      SELECT 1 FROM "Booking" AS b
      WHERE b."listingId" = l."id" AND b."status" IN ('pending', 'accepted')
    )
  );

COMMIT;
