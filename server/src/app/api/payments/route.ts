import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';

const paymentSchema = z.object({
  bookingId: z.string().cuid(),
  method: z.enum(['flooz', 'tmoney', 'wave', 'orange_money', 'cash']),
  phone: z.string().min(8).max(15),
});

export async function GET() {
  const mode = process.env.PAYMENT_MODE === 'demo'
    ? 'demo'
    : process.env.PAYMENT_MODE === 'kagopay' && process.env.KAGOPAY_API_KEY
      ? 'kagopay'
      : 'unavailable';

  return NextResponse.json({ mode });
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { bookingId, method, phone } = parsed.data;

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { listing: true, payment: true },
    });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Booking must be accepted before payment' },
        { status: 400 }
      );
    }

    const bookingDays = Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (!Number.isFinite(bookingDays) || bookingDays <= 0) {
      return NextResponse.json({ error: 'Booking dates are invalid' }, { status: 400 });
    }
    const amount = Math.round((booking.listing.price / 30) * bookingDays);
    if (amount <= 0) {
      return NextResponse.json({ error: 'Booking amount is invalid' }, { status: 400 });
    }
    const isDemoMode = process.env.PAYMENT_MODE === 'demo';
    if (!isDemoMode) {
      return NextResponse.json(
        { error: 'Payment provider integration is not configured' },
        { status: 501 }
      );
    }
    if (booking.payment && booking.payment.status === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    const existing = await db.payment.findUnique({ where: { bookingId } });
    if (existing) {
      return NextResponse.json({ error: 'Payment already initiated' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        bookingId,
        method,
        phone,
        amount,
        status: 'pending',
        transactionRef: `LOC${Date.now()}${Math.floor(Math.random() * 1000)}`,
      },
    });

    const message = `Demo mode: A payment request of ${amount} FCFA has been simulated for ${phone}. Enter any 4-6 digit code to verify.`;

    return NextResponse.json({
      success: true,
      payment,
      message,
      isDemoMode,
    });
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return NextResponse.json({ error: 'Failed to initiate payment' }, { status: 500 });
  }
}
