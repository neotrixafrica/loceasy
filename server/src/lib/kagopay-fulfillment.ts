import { timingSafeEqual } from 'crypto';
import { db } from './db';
import { refreshListingFromBookings } from './listing-status';

function secrets(): string[] {
  return [process.env.KAGOPAY_WEBHOOK_SECRET, process.env.KAGOPAY_API_KEY].filter(
    (s): s is string => Boolean(s)
  );
}

export function verifyKagoPayWebhook(request: Request): boolean {
  const expected = secrets();
  if (expected.length === 0) return false;

  const candidates = [
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, ''),
    request.headers.get('x-kagopay-signature'),
    request.headers.get('x-webhook-secret'),
  ].filter((v): v is string => Boolean(v));

  for (const got of candidates) {
    const gotBuf = Buffer.from(got);
    for (const secret of expected) {
      const expBuf = Buffer.from(secret);
      if (gotBuf.length === expBuf.length && timingSafeEqual(gotBuf, expBuf)) {
        return true;
      }
    }
  }
  return false;
}

function methodFromOperator(operator?: string): 'yas_togo' | 'moov_togo' {
  return operator === 'yas' || operator === 'yas_togo' ? 'yas_togo' : 'moov_togo';
}

export async function fulfillPaidReference(
  reference: string,
  extras?: { operator?: string; phone?: string }
) {
  const paymentLink = await db.paymentLink.findFirst({
    where: { feexpayId: reference },
    include: { booking: { select: { status: true } } },
  });
  if (!paymentLink) {
    return { ok: false as const, error: 'Payment link not found', status: 404 };
  }
  if (paymentLink.status === 'paid') {
    return { ok: true as const, already: true, bookingId: paymentLink.bookingId };
  }
  if (paymentLink.booking.status !== 'accepted') {
    return {
      ok: false as const,
      error: 'The landlord must accept this booking before payment',
      status: 409,
    };
  }

  const booking = await db.booking.update({
    where: { id: paymentLink.bookingId },
    data: {
      paymentStatus: 'paid',
    },
    include: {
      listing: { select: { id: true, title: true, landlordId: true } },
      tenant: { select: { id: true, phone: true } },
    },
  });

  await db.paymentLink.update({
    where: { id: paymentLink.id },
    data: { status: 'paid' },
  });

  const method = methodFromOperator(extras?.operator);
  await db.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      amount: paymentLink.amount,
      method,
      phone: extras?.phone || booking.tenant.phone || '',
      status: 'paid',
      transactionRef: reference,
    },
    update: {
      status: 'paid',
      transactionRef: reference,
      phone: extras?.phone || booking.tenant.phone || '',
      method,
    },
  });

  await refreshListingFromBookings(booking.listing.id);

  await db.notification.createMany({
    data: [
      {
        userId: booking.listing.landlordId,
        type: 'payment',
        title: 'Paiement reçu',
        body: `Le paiement de ${paymentLink.amount.toLocaleString()} FCFA a été reçu pour ${booking.listing.title}`,
        link: `booking:${booking.id}`,
      },
      {
        userId: booking.tenantId,
        type: 'booking',
        title: 'Réservation confirmée',
        body: `Votre réservation pour ${booking.listing.title} a été confirmée. Le logement est désormais loué.`,
        link: `booking:${booking.id}`,
      },
    ],
  });

  return { ok: true as const, already: false, bookingId: booking.id };
}

export async function markPaymentFailed(reference: string) {
  const paymentLink = await db.paymentLink.findFirst({
    where: { feexpayId: reference },
  });
  if (!paymentLink) return;

  const changed = await db.paymentLink.updateMany({
    where: { id: paymentLink.id, status: 'pending' },
    data: { status: 'failed' },
  });
  if (changed.count !== 1) return;
  await db.booking.updateMany({
    where: { id: paymentLink.bookingId, paymentStatus: { not: 'paid' } },
    data: { paymentStatus: 'failed' },
  });
}
