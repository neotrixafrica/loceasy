import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    if (!['available', 'viewing_in_progress', 'reserved', 'rented'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify user owns this listing
    const listing = await db.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.landlordId !== currentUser.id) {
      return NextResponse.json({ error: 'You do not own this listing' }, { status: 403 });
    }

    // Update listing status
    const updatedListing = await db.listing.update({
      where: { id },
      data: {
        status,
        available: status === 'available',
      },
    });

    return NextResponse.json({
      success: true,
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
