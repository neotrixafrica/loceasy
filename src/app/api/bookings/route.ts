import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');
    const landlordId = searchParams.get('landlordId');

    const where: Record<string, unknown> = {};

    if (tenantId) {
      where.tenantId = tenantId;
    }
    if (landlordId) {
      where.listing = { landlordId };
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        tenant: { select: { id: true, name: true, avatar: true, phone: true } },
        listing: {
          select: { id: true, title: true, city: true, quartier: true, price: true, images: true },
        },
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
    const body = await request.json();
    const { startDate, endDate, message, tenantId, listingId } = body;

    if (!startDate || !endDate || !tenantId || !listingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const booking = await db.booking.create({
      data: {
        status: 'pending',
        startDate,
        endDate,
        message: message || null,
        tenantId,
        listingId,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
