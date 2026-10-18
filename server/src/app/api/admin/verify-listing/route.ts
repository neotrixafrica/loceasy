import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, verified } = await req.json();

    if (!listingId || typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Listing ID and verified status are required' }, { status: 400 });
    }

    await db.listing.update({
      where: { id: listingId },
      data: {
        verified,
        verificationDate: verified ? new Date() : null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: verified ? 'Listing verified' : 'Listing verification removed',
    });
  } catch (error) {
    console.error('Error verifying listing:', error);
    return NextResponse.json({ error: 'Failed to verify listing' }, { status: 500 });
  }
}
