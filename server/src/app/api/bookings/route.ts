import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { bookingSchema } from '@/lib/validation';
import { availableFlag, deriveListingStatus } from '@/lib/listing-status';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const scope = searchParams.get('scope');

    let where: Record<string, unknown> = {};
    if (currentUser.role === 'landlord') {
      where = { listing: { landlordId: currentUser.id } };
    } else {
      where = { tenantId: currentUser.id };
    }

    if (scope === 'landlord' && currentUser.role === 'landlord') {
      where = { listing: { landlordId: currentUser.id } };
    } else if (scope === 'tenant') {
      where = { tenantId: currentUser.id };
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, avatar: true, phone: true } },
        listing: {
          select: { id: true, title: true, city: true, quartier: true, price: true, images: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'tenant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { startDate, endDate, message, listingId } = parsed.data;
    const result = await db.$transaction(async (tx) => {
      const listing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { id: true, title: true, landlordId: true },
      });

      if (!listing) {
        return { ok: false as const, error: 'Logement introuvable', status: 404 };
      }

      // Claim the listing with a conditional update. Concurrent requests can only
      // move it from available to viewing_in_progress once.
      const claim = await tx.listing.updateMany({
        where: { id: listingId, status: 'available', available: true },
        data: { status: 'viewing_in_progress', available: false },
      });

      if (claim.count !== 1) {
        return {
          ok: false as const,
          error: 'Ce logement n’est plus disponible pour une nouvelle demande',
          status: 409,
        };
      }

      const activeBookings = await tx.booking.findMany({
        where: { listingId, status: { in: ['pending', 'accepted'] } },
        select: { status: true, paymentStatus: true },
      });

      if (activeBookings.length > 0) {
        const listingStatus = deriveListingStatus(activeBookings);
        await tx.listing.update({
          where: { id: listingId },
          data: { status: listingStatus, available: availableFlag(listingStatus) },
        });

        return {
          ok: false as const,
          error: 'Une demande est déjà en cours pour ce logement',
          status: 409,
        };
      }

      const booking = await tx.booking.create({
        data: {
          status: 'pending',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          message: message || null,
          tenantId: currentUser.id,
          listingId,
        },
      });

      return { ok: true as const, booking, listing };
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await db.notification.create({
      data: {
        userId: result.listing.landlordId,
        type: 'booking',
        title: 'Nouvelle demande de réservation',
        body: `${currentUser.name} demande ${result.listing.title}`,
        link: `booking:${result.booking.id}`,
      },
    });

    return NextResponse.json(result.booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
