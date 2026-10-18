import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';
import { availableFlag, deriveListingStatus } from '@/lib/listing-status';

const verifySchema = z.object({
  paymentId: z.string().cuid(),
  code: z.string().min(4).max(6),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { paymentId, code } = parsed.data;

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (payment.booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (payment.booking.status !== 'accepted') {
      return NextResponse.json(
        { error: 'The landlord must accept this booking before payment' },
        { status: 409 }
      );
    }
    if (payment.status !== 'pending') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    // Payment verification
    const isDemoMode = process.env.PAYMENT_MODE === 'demo';

    if (isDemoMode) {
      // Demo mode: any 4-6 digit code is accepted
      const isValidCode = /^\d{4,6}$/.test(code);
      if (!isValidCode) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
      }
    } else {
      // Production mode: integrate with real payment provider API
      // TODO: Call the actual payment provider API to verify the code
      // Example for Flooz/TMoney/Wave/Orange Money
      // const verificationResult = await verifyPaymentWithProvider(payment.transactionRef, code);
      // if (!verificationResult.success) {
      //   return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      // }
      return NextResponse.json(
        { error: 'Payment provider integration not configured. Set PAYMENT_MODE=demo for testing.' },
        { status: 501 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: payment.booking.listingId },
        select: { status: true, available: true },
      });
      if (!listing) return { ok: false as const };

      // Use the same listing-first lock order as booking state changes.
      const listingLock = await tx.listing.updateMany({
        where: { id: payment.booking.listingId, status: listing.status },
        data: { status: listing.status, available: listing.available },
      });
      if (listingLock.count !== 1) return { ok: false as const };

      const currentBooking = await tx.booking.findUnique({
        where: { id: payment.bookingId },
        select: { status: true, paymentStatus: true },
      });
      if (!currentBooking || currentBooking.status !== 'accepted' || currentBooking.paymentStatus === 'paid') {
        return { ok: false as const };
      }

      const paymentUpdate = await tx.payment.updateMany({
        where: { id: paymentId, status: 'pending' },
        data: { status: 'paid' },
      });
      if (paymentUpdate.count !== 1) return { ok: false as const };

      const bookingUpdate = await tx.booking.updateMany({
        where: {
          id: payment.bookingId,
          status: 'accepted',
          paymentStatus: { not: 'paid' },
        },
        data: { paymentStatus: 'paid' },
      });
      if (bookingUpdate.count !== 1) {
        throw new Error('Booking changed before payment confirmation');
      }

      const activeBookings = await tx.booking.findMany({
        where: { listingId: payment.booking.listingId, status: { in: ['pending', 'accepted'] } },
        select: { status: true, paymentStatus: true },
      });
      const listingStatus = deriveListingStatus(activeBookings);
      await tx.listing.update({
        where: { id: payment.booking.listingId },
        data: { status: listingStatus, available: availableFlag(listingStatus) },
      });

      const [updatedPayment, updatedBooking] = await Promise.all([
        tx.payment.findUnique({ where: { id: paymentId } }),
        tx.booking.findUnique({ where: { id: payment.bookingId } }),
      ]);
      if (!updatedPayment || !updatedBooking) throw new Error('Payment confirmation was not saved');
      return { ok: true as const, updatedPayment, updatedBooking };
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'Booking or payment status changed. Refresh and retry.' }, { status: 409 });
    }
    const { updatedPayment, updatedBooking } = result;

    const listing = await db.listing.findUnique({ where: { id: updatedBooking.listingId }, select: { title: true, landlordId: true } });
    if (listing) {
      await db.notification.create({
        data: {
          userId: listing.landlordId,
          type: 'payment',
          title: 'Paiement reçu',
          body: `${currentUser.name} a payé ${payment.amount.toLocaleString()} FCFA pour ${listing.title}`,
          link: `booking:${payment.bookingId}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: 'Payment successful. Your booking is confirmed.',
    });
  } catch (error) {
    console.error('POST /api/payments/verify error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
