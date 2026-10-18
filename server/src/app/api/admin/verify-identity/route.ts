import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can add an admin role check here)
    // For now, we'll skip this check

    const { userId, status, rejectionReason } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ error: 'User ID and status are required' }, { status: 400 });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      verificationStatus: status,
      verificationReviewedAt: new Date(),
    };

    if (status === 'verified') {
      updateData.verified = true;
    } else {
      updateData.verified = false;
      updateData.verificationRejectionReason = rejectionReason;
    }

    await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Identity verification ${status}`,
    });
  } catch (error) {
    console.error('Error reviewing identity verification:', error);
    return NextResponse.json({ error: 'Failed to review verification' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get pending verifications
    const pendingVerifications = await db.user.findMany({
      where: {
        verificationStatus: 'pending',
        verificationDoc: { not: null },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        verificationDoc: true,
        verificationDocType: true,
        verificationSubmittedAt: true,
        city: true,
      },
      orderBy: {
        verificationSubmittedAt: 'asc',
      },
    });

    return NextResponse.json({ verifications: pendingVerifications });
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ error: 'Failed to fetch verifications' }, { status: 500 });
  }
}
