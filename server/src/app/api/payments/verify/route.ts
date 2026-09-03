import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';

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

    const [updatedPayment, updatedBooking] = await db.$transaction([
      db.payment.update({
        where: { id: paymentId },
        data: { status: 'paid' },
      }),
      db.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'paid' },
      }),
    ]);

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
