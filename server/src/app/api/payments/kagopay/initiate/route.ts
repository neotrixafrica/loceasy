import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { initiateKagoPayPayment, formatTogoPhone, type KagoPayPaymentResponse } from '@/lib/kagopay';
import { z } from 'zod';

const initiateSchema = z.object({
  bookingId: z.string().cuid(),
  phone: z.string().trim().min(8).max(16).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = request.nextUrl.searchParams.get('bookingId');
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { paymentLink: true },
    });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (booking.status !== 'accepted') {
      return NextResponse.json({ error: 'Booking must be accepted before payment' }, { status: 409 });
    }

    const link = booking.paymentLink;
    return NextResponse.json({
      paymentLink: link ? {
        amount: link.amount,
        currency: link.currency,
        reference: link.feexpayId,
        status: link.status,
        expiresAt: link.expiresAt,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching KagoPay payment:', error);
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (process.env.PAYMENT_MODE !== 'kagopay') {
      return NextResponse.json({ error: 'KagoPay is not the active payment provider' }, { status: 409 });
    }
    if (!process.env.KAGOPAY_API_KEY) {
      return NextResponse.json({ error: 'KagoPay credentials are not configured' }, { status: 503 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = initiateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((issue) => issue.message).join(', ') },
        { status: 400 }
      );
    }
    const { bookingId, phone } = parsed.data;

    // Récupérer la réservation
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        tenant: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le locataire
    if (booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (booking.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Le propriétaire doit accepter la demande avant le paiement' },
        { status: 409 }
      );
    }
    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    const phoneToUse = phone || booking.tenant.phone || currentUser.phone;
    if (!phoneToUse) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // Calculer le montant
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (!Number.isFinite(days) || days <= 0) {
      return NextResponse.json({ error: 'Booking dates are invalid' }, { status: 400 });
    }
    const amount = Math.round((booking.listing.price / 30) * days);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Booking amount is invalid' }, { status: 400 });
    }

    const reference = `LOC-${bookingId}-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const paymentLinkResult = await db.$transaction(async (tx) => {
      const existing = await tx.paymentLink.findUnique({ where: { bookingId } });
      if (existing?.status === 'paid') return { kind: 'paid' as const };
      if (existing?.status === 'pending') return { kind: 'pending' as const };

      if (existing) {
        const claim = await tx.paymentLink.updateMany({
          where: { id: existing.id, status: existing.status },
          data: { amount, currency: 'XOF', status: 'pending', feexpayId: reference, expiresAt },
        });
        if (claim.count !== 1) return { kind: 'pending' as const };
        return { kind: 'ready' as const, paymentLinkId: existing.id };
      }

      const created = await tx.paymentLink.create({
        data: {
          bookingId,
          amount,
          currency: 'XOF',
          status: 'pending',
          feexpayId: reference,
          expiresAt,
        },
      });
      return { kind: 'ready' as const, paymentLinkId: created.id };
    }).catch((error: unknown) => {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        return { kind: 'pending' as const };
      }
      throw error;
    });

    if (paymentLinkResult.kind === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }
    if (paymentLinkResult.kind === 'pending') {
      return NextResponse.json(
        { error: 'Un paiement est déjà en cours. Vérifiez son état avant de recommencer.' },
        { status: 409 }
      );
    }
    const paymentLinkId = paymentLinkResult.paymentLinkId;

    // The unique reference is stored before contacting the provider so an
    // immediate webhook can resolve it to this booking.
    const formattedPhone = formatTogoPhone(phoneToUse);

    let kagoPayResponse: KagoPayPaymentResponse;
    try {
      kagoPayResponse = await initiateKagoPayPayment({
        phone: formattedPhone,
        amount,
        description: `LocEasy - ${booking.listing.title}`,
        reference,
      });
    } catch (error) {
      await db.paymentLink.updateMany({
        where: { id: paymentLinkId, feexpayId: reference, status: 'pending' },
        data: { status: 'failed' },
      });
      throw error;
    }

    if (kagoPayResponse.status === 'failed') {
      await db.paymentLink.updateMany({
        where: { id: paymentLinkId, feexpayId: reference, status: 'pending' },
        data: { status: 'failed' },
      });
    }

    return NextResponse.json({
      paymentLinkId,
      amount,
      currency: 'XOF',
      reference,
      status: kagoPayResponse.status,
      operator: kagoPayResponse.operator,
      message: kagoPayResponse.message || 'Confirmez la demande de paiement sur votre téléphone.',
    });
  } catch (error) {
    console.error('Error initiating KagoPay payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
