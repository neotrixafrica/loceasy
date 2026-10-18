-- Complete the historical schema after the init and review migrations.
-- This is additive and includes data backfills for fields introduced here.

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('flooz', 'tmoney', 'wave', 'orange_money', 'cash', 'yas_togo', 'moov_togo');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'rejected');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('user', 'listing', 'message');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('available', 'viewing_in_progress', 'reserved', 'rented');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "phoneOtp" TEXT,
ADD COLUMN     "phoneOtpExpires" TIMESTAMP(3),
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "responseRate" DOUBLE PRECISION,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "totalBookings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalListings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "verificationDocType" TEXT,
ADD COLUMN     "verificationRejectionReason" TEXT,
ADD COLUMN     "verificationReviewedAt" TIMESTAMP(3),
ADD COLUMN     "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "verificationSubmittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "status" "ListingStatus" NOT NULL DEFAULT 'available',
ADD COLUMN     "verificationDate" TIMESTAMP(3),
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'pending';

-- Preserve approved user verification and derive current listing states from bookings.
UPDATE "User"
SET "verificationStatus" = 'verified'
WHERE "verified" = true AND "verificationStatus" = 'pending';

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

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "transactionRef" TEXT,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentLink" (
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

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionRef_key" ON "Payment"("transactionRef");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_bookingId_key" ON "PaymentLink"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_feexpayId_key" ON "PaymentLink"("feexpayId");

-- CreateIndex
CREATE INDEX "PaymentLink_status_idx" ON "PaymentLink"("status");

-- CreateIndex
CREATE INDEX "PaymentLink_expiresAt_idx" ON "PaymentLink"("expiresAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Report_type_idx" ON "Report"("type");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_targetUserId_idx" ON "Report"("targetUserId");

-- CreateIndex
CREATE INDEX "Report_targetListingId_idx" ON "Report"("targetListingId");

-- CreateIndex
CREATE INDEX "User_verificationStatus_idx" ON "User"("verificationStatus");

-- CreateIndex
CREATE INDEX "User_trustScore_idx" ON "User"("trustScore");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_verified_idx" ON "Listing"("verified");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentLink" ADD CONSTRAINT "PaymentLink_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetListingId_fkey" FOREIGN KEY ("targetListingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetMessageId_fkey" FOREIGN KEY ("targetMessageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
