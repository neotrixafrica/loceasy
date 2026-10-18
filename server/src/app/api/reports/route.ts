import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, reason, description, targetUserId, targetListingId, targetMessageId } = await req.json();

    if (!type || !reason) {
      return NextResponse.json({ error: 'Type and reason are required' }, { status: 400 });
    }

    if (!['user', 'listing', 'message'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Validate target based on type
    if (type === 'user' && !targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required for user reports' }, { status: 400 });
    }
    if (type === 'listing' && !targetListingId) {
      return NextResponse.json({ error: 'Target listing ID is required for listing reports' }, { status: 400 });
    }
    if (type === 'message' && !targetMessageId) {
      return NextResponse.json({ error: 'Target message ID is required for message reports' }, { status: 400 });
    }

    // Create report
    const report = await db.report.create({
      data: {
        type,
        reason,
        description,
        reporterId: currentUser.id,
        targetUserId,
        targetListingId,
        targetMessageId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      reportId: report.id,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's reports
    const reports = await db.report.findMany({
      where: {
        reporterId: session.userId,
      },
      include: {
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        message: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
