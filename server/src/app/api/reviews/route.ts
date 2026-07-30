import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional().nullable(),
  listingId: z.string().cuid(),
});

export async function GET(request: NextRequest) {
  try {
    const listingId = request.nextUrl.searchParams.get('listingId');
    if (!listingId) {
      return NextResponse.json({ error: 'listingId is required' }, { status: 400 });
    }

    const reviews = await db.review.findMany({
      where: { listingId },
      include: {
        tenant: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await db.review.aggregate({
      where: { listingId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return NextResponse.json({
      reviews,
      average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
      count: stats._count.rating,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== 'tenant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }

    const { rating, comment, listingId } = parsed.data;

    // Verify the user has an accepted booking for this listing
    const booking = await db.booking.findFirst({
      where: {
        tenantId: currentUser.id,
        listingId,
        status: 'accepted',
      },
    });
    if (!booking) {
      return NextResponse.json(
        { error: 'You can only review listings where you have a confirmed stay' },
        { status: 403 }
      );
    }

    const review = await db.review.upsert({
      where: {
        listingId_tenantId: { listingId, tenantId: currentUser.id },
      },
      update: { rating, comment },
      create: {
        rating,
        comment,
        listingId,
        tenantId: currentUser.id,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
