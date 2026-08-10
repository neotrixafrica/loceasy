import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { bookingStatusSchema } from '@/lib/validation';

const ALLOWED_STATUSES = ['accepted', 'rejected', 'cancelled', 'pending'];

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
      include: { listing: { select: { landlordId: true } } },
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
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Only landlord can accept/reject; tenant can cancel
    const isLandlordAction = ['accepted', 'rejected'].includes(status);
    if (isLandlordAction && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (status === 'cancelled' && !isTenant && !isLandlord) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status: status as 'pending' | 'accepted' | 'rejected' | 'cancelled' },
    });

    const listing = await db.listing.findUnique({ where: { id: booking.listingId }, select: { title: true } });
    const statusLabel = status === 'accepted' ? 'acceptée' : status === 'rejected' ? 'refusée' : 'mise à jour';
    await db.notification.create({
      data: {
        userId: booking.tenantId,
        type: 'booking',
        title: `Réservation ${statusLabel}`,
        body: listing ? `Votre demande pour ${listing.title} a été ${statusLabel}` : `Votre demande de réservation a été ${statusLabel}`,
        link: `booking:${booking.id}`,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
