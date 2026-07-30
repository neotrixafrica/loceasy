import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { listingSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city') || '';
    const quartier = searchParams.get('quartier') || '';
    const type = searchParams.get('type') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search') || '';

    const where: Record<string, unknown> = { available: true };

    if (city) where.city = city;
    if (quartier) where.quartier = quartier;
    if (type) where.type = type;
    if (minPrice) where.price = { ...(where.price as Record<string, unknown> || {}), gte: Number(minPrice) };
    if (maxPrice) where.price = { ...(where.price as Record<string, unknown> || {}), lte: Number(maxPrice) };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } },
        { quartier: { contains: search } },
      ];
    }

    // Fix price filter - if both min and max are set
    if (minPrice && maxPrice) {
      where.price = { gte: Number(minPrice), lte: Number(maxPrice) };
    } else if (minPrice) {
      where.price = { gte: Number(minPrice) };
    } else if (maxPrice) {
      where.price = { lte: Number(maxPrice) };
    }

    const listings = await db.listing.findMany({
      where,
      include: {
        landlord: {
          select: { id: true, name: true, avatar: true, phone: true, city: true, verified: true },
        },
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = listings.map((l) => {
      const avg = l.reviews.length
        ? Number((l.reviews.reduce((sum, r) => sum + r.rating, 0) / l.reviews.length).toFixed(1))
        : 0;
      return { ...l, averageRating: avg, reviewCount: l._count.reviews };
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'landlord') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = listingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const listing = await db.listing.create({
      data: {
        ...data,
        landlordId: currentUser.id,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}
