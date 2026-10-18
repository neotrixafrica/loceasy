import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { hashOtp } from '@/lib/otp';

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otp } = await req.json();

    if (!otp) {
      return NextResponse.json({ error: 'OTP is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if OTP matches and is not expired
    const expectedHash = hashOtp(currentUser.id, otp);
    if (!user.phoneOtp || user.phoneOtp !== expectedHash) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (!user.phoneOtpExpires || new Date() > user.phoneOtpExpires) {
      return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
    }

    // Verify phone
    await db.user.update({
      where: { id: currentUser.id },
      data: {
        phoneVerified: true,
        phoneVerifiedAt: new Date(),
        phoneOtp: null,
        phoneOtpExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Phone verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
