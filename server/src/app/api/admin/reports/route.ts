import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can add admin role check here)
    // For now, we'll skip this check

    // Get all pending reports
    const reports = await db.report.findMany({
      where: {
        status: 'pending',
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            landlordId: true,
          },
        },
        message: {
          select: {
            id: true,
            content: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reportId, status, resolution } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: 'Report ID and status are required' }, { status: 400 });
    }

    if (!['reviewed', 'resolved', 'dismissed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: currentUser.id,
    };

    if (resolution) {
      updateData.resolution = resolution;
    }

    // If resolving a report, take action on the target
    if (status === 'resolved' || status === 'dismissed') {
      const report = await db.report.findUnique({
        where: { id: reportId },
        include: {
          targetUser: true,
          listing: true,
        },
      });

      if (report) {
        // If it's a user report and resolved, decrease trust score
        if (report.type === 'user' && report.targetUser && status === 'resolved') {
          await db.user.update({
            where: { id: report.targetUserId },
            data: {
              trustScore: Math.max(0, (report.targetUser.trustScore || 0) - 20),
            },
          });
        }

        // If it's a listing report and resolved, unverify the listing
        if (report.type === 'listing' && report.listing && status === 'resolved') {
          await db.listing.update({
            where: { id: report.targetListingId },
            data: {
              verified: false,
              verificationDate: null,
            },
          });
        }
      }
    }

    await db.report.update({
      where: { id: reportId },
      data: updateData,
    });

    return NextResponse.json({ 
      success: true, 
      message: `Report ${status}`,
    });
  } catch (error) {
    console.error('Error reviewing report:', error);
    return NextResponse.json({ error: 'Failed to review report' }, { status: 500 });
  }
}
