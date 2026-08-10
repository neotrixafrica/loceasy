import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { bookingSchema } from '@/lib/validation';

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

    const listing = await db.listing.findUnique({ where: { id: listingId }, select: { title: true, landlordId: true } });

    const booking = await db.booking.create({
      data: {
        status: 'pending',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        message: message || null,
        tenantId: currentUser.id,
        listingId,
      },
    });

    if (listing) {
      await db.notification.create({
        data: {
          userId: listing.landlordId,
          type: 'booking',
          title: 'Nouvelle demande de réservation',
          body: `${currentUser.name} demande ${listing.title}`,
          link: `booking:${booking.id}`,
        },
      });
    }

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
