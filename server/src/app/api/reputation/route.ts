import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { updateUserReputation, updateAllUsersReputation } from '@/lib/reputation';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, updateAll } = await req.json();

    if (updateAll) {
      // Update all users (admin only - you can add admin role check here)
      await updateAllUsersReputation();
      return NextResponse.json({ success: true, message: 'All users reputation updated' });
    }

    if (userId) {
      // Update specific user
      await updateUserReputation(userId);
      return NextResponse.json({ success: true, message: 'User reputation updated' });
    }

    // Update current user
    await updateUserReputation(currentUser.id);
    return NextResponse.json({ success: true, message: 'Your reputation updated' });
  } catch (error) {
    console.error('Error updating reputation:', error);
    return NextResponse.json({ error: 'Failed to update reputation' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = new URL(req.url).searchParams;
    const targetUserId = userId || currentUser.id;

    const user = await db.user.findUnique({
      where: { id: targetUserId },
      select: {
        totalListings: true,
        totalBookings: true,
        completedBookings: true,
        totalReviews: true,
        averageRating: true,
        responseRate: true,
        responseTime: true,
        trustScore: true,
        badge: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching reputation:', error);
    return NextResponse.json({ error: 'Failed to fetch reputation' }, { status: 500 });
  }
}
