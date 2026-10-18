import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { availableFlag, deriveListingStatus } from '@/lib/listing-status';
import { verifyKagoPayWebhook } from '@/lib/kagopay-fulfillment';

export async function POST(request: NextRequest) {
  try {
    if (!verifyKagoPayWebhook(request)) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const body = await request.json();

    const { reference, status, operator, phone, amount } = body;

    if (!reference || !status) {
      console.error('Missing required fields in webhook');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Traiter uniquement les paiements réussis
    if (status === 'success' || status === 'SUCCESS') {
      // Trouver le lien de paiement par référence
      const paymentLink = await db.paymentLink.findFirst({
        where: {
          feexpayId: reference,
        },
      });

      if (!paymentLink) {
        console.error('Payment link not found for reference:', reference);
        return NextResponse.json({ error: 'Payment link not found' }, { status: 404 });
      }

      const receivedAmount = typeof amount === 'number' ? amount : Number(amount);
      if (!Number.isFinite(receivedAmount) || receivedAmount !== paymentLink.amount) {
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 409 });
      }

      const result = await db.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { id: paymentLink.bookingId },
          include: {
            listing: { select: { id: true, title: true, landlordId: true, status: true, available: true } },
            tenant: { select: { phone: true } },
          },
        });
        if (!booking) return { ok: false as const, error: 'Booking not found' };

        const listingLock = await tx.listing.updateMany({
          where: { id: booking.listing.id, status: booking.listing.status },
          data: { status: booking.listing.status, available: booking.listing.available },
        });
        if (listingLock.count !== 1) {
          return { ok: false as const, error: 'Listing state changed' };
        }

        const currentPaymentLink = await tx.paymentLink.findUnique({
          where: { id: paymentLink.id },
        });
        if (!currentPaymentLink) return { ok: false as const, error: 'Payment link not found' };
        if (currentPaymentLink.status === 'paid') {
          return { ok: true as const, already: true };
        }
        if (currentPaymentLink.status !== 'pending') {
          return { ok: false as const, error: 'Payment is no longer pending' };
        }
        if (booking.status !== 'accepted') {
          return { ok: false as const, error: 'The landlord must accept this booking before payment' };
        }

        const linkUpdate = await tx.paymentLink.updateMany({
          where: { id: paymentLink.id, status: 'pending' },
          data: { status: 'paid' },
        });
        if (linkUpdate.count !== 1) {
          return { ok: false as const, error: 'Payment is no longer pending' };
        }

        const bookingUpdate = await tx.booking.updateMany({
          where: { id: booking.id, status: 'accepted', paymentStatus: { not: 'paid' } },
          data: { paymentStatus: 'paid' },
        });
        if (bookingUpdate.count !== 1) {
          throw new Error('Booking changed before payment confirmation');
        }

        const method = operator === 'yas' || operator === 'yas_togo' ? 'yas_togo' : 'moov_togo';
        await tx.payment.upsert({
          where: { bookingId: booking.id },
          create: {
            bookingId: booking.id,
            amount: paymentLink.amount,
            method,
            phone: phone || booking.tenant.phone || '',
            status: 'paid',
            transactionRef: reference,
          },
          update: {
            status: 'paid',
            transactionRef: reference,
            phone: phone || booking.tenant.phone || '',
          },
        });

        const activeBookings = await tx.booking.findMany({
          where: { listingId: booking.listing.id, status: { in: ['pending', 'accepted'] } },
          select: { status: true, paymentStatus: true },
        });
        const listingStatus = deriveListingStatus(activeBookings);
        await tx.listing.update({
          where: { id: booking.listing.id },
          data: { status: listingStatus, available: availableFlag(listingStatus) },
        });

        await tx.notification.createMany({
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
              body: `Votre réservation pour ${booking.listing.title} a été confirmée`,
              link: `booking:${booking.id}`,
            },
          ],
        });

        return { ok: true as const, already: false };
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 409 });
      }
      if (result.already) {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      console.log('Payment processed successfully for booking:', paymentLink.bookingId);
      return NextResponse.json({ success: true });
    }

    // Gérer les autres statuts (failed, cancelled, etc.)
    if (status === 'failed' || status === 'FAILED') {
      const paymentLink = await db.paymentLink.findFirst({
        where: {
          feexpayId: reference,
        },
      });

      if (paymentLink?.status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      if (paymentLink) {
        await db.$transaction(async (tx) => {
          const changed = await tx.paymentLink.updateMany({
            where: { id: paymentLink.id, status: 'pending' },
            data: { status: 'failed' },
          });

          if (changed.count === 1) {
            await tx.booking.updateMany({
              where: { id: paymentLink.bookingId, paymentStatus: { not: 'paid' } },
              data: { paymentStatus: 'failed' },
            });
          }
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing KagoPay webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
