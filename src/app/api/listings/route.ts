import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
          select: { id: true, name: true, avatar: true, phone: true, city: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(listings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title, description, price, type, city, quartier, address,
      latitude, longitude, rooms, area, amenities, images, rules, landlordId,
    } = body;

    if (!title || !description || !price || !type || !city || !landlordId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const listing = await db.listing.create({
      data: {
        title,
        description,
        price: Number(price),
        type,
        city,
        quartier: quartier || null,
        address: address || null,
        latitude: latitude || null,
        longitude: longitude || null,
        rooms: rooms || 1,
        area: area || null,
        amenities: amenities || [],
        images: images || [],
        rules: rules || null,
        landlordId,
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
