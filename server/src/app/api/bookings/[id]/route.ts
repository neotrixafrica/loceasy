import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { bookingStatusSchema } from '@/lib/validation';
import { availableFlag, deriveListingStatus } from '@/lib/listing-status';

const ALLOWED_STATUSES = ['accepted', 'rejected', 'cancelled'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.booking.findUnique({
      where: { id },
      include: { listing: { select: { landlordId: true, title: true, status: true, available: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isTenant = existing.tenantId === currentUser.id;
    const isLandlord = existing.listing.landlordId === currentUser.id;
    if (!isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = bookingStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Transition de réservation invalide' }, { status: 400 });
    }

    const isLandlordAction = status === 'accepted' || status === 'rejected';
    if (isLandlordAction && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (status === existing.status) {
      return NextResponse.json(existing);
    }

    if (status === 'accepted' && existing.status !== 'pending') {
      return NextResponse.json({ error: 'Seule une demande en attente peut être acceptée' }, { status: 409 });
    }
    if (status === 'rejected' && existing.status !== 'pending') {
      return NextResponse.json({ error: 'Seule une demande en attente peut être refusée' }, { status: 409 });
    }
    if (status === 'cancelled' && existing.status !== 'pending' && existing.status !== 'accepted') {
      return NextResponse.json({ error: 'Cette réservation ne peut plus être annulée' }, { status: 409 });
    }
    if (status === 'cancelled' && existing.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Un paiement reçu doit être remboursé avant l’annulation' }, { status: 409 });
    }

    const result = await db.$transaction(async (tx) => {
      // Lock the listing row first so creation, approval and cancellation serialize
      // on the same listing before changing booking state.
      const listingLock = await tx.listing.updateMany({
        where: { id: existing.listingId, status: existing.listing.status },
        data: {
          status: existing.listing.status,
          available: existing.listing.available,
        },
      });

      if (listingLock.count !== 1) {
        return { ok: false as const, error: 'Le logement a changé. Actualisez puis réessayez.' };
      }

      if (status === 'accepted') {
        if (existing.listing.status === 'rented') {
          return { ok: false as const, error: 'Ce logement est déjà loué' };
        }

        const competingBookings = await tx.booking.count({
          where: {
            listingId: existing.listingId,
            id: { not: id },
            status: { in: ['pending', 'accepted'] },
          },
        });

        if (competingBookings > 0) {
          return { ok: false as const, error: 'Une autre demande est déjà en cours pour ce logement' };
        }
      }

      const update = await tx.booking.updateMany({
        where: {
          id,
          status: existing.status,
          ...(status === 'cancelled' ? { paymentStatus: { not: 'paid' as const } } : {}),
        },
        data: { status },
      });

      if (update.count !== 1) {
        return { ok: false as const, error: 'La réservation a déjà été modifiée. Actualisez puis réessayez.' };
      }

      const activeBookings = await tx.booking.findMany({
        where: { listingId: existing.listingId, status: { in: ['pending', 'accepted'] } },
        select: { status: true, paymentStatus: true },
      });
      const listingStatus = deriveListingStatus(activeBookings);

      await tx.listing.update({
        where: { id: existing.listingId },
        data: { status: listingStatus, available: availableFlag(listingStatus) },
      });

      const booking = await tx.booking.findUnique({ where: { id } });
      if (!booking) {
        return { ok: false as const, error: 'Réservation introuvable' };
      }

      return { ok: true as const, booking };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    const booking = result.booking;
    const recipientId = isLandlord ? booking.tenantId : existing.listing.landlordId;
    const statusLabel = status === 'accepted' ? 'acceptée' : status === 'rejected' ? 'refusée' : 'annulée';
    await db.notification.create({
      data: {
        userId: recipientId,
        type: 'booking',
        title: `Réservation ${statusLabel}`,
        body: `La réservation pour ${existing.listing.title} a été ${statusLabel}`,
        link: `booking:${booking.id}`,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
