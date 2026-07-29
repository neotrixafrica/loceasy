import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

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
    const { status } = body;

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

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
