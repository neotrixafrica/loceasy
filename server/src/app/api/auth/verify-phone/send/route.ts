import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { generateOtp, hashOtp, isResendTooSoon, otpExpiry } from '@/lib/otp';
import { sendSms } from '@/lib/sms';
import { formatTogoPhone } from '@/lib/kagopay';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const rawPhone = typeof body.phone === 'string' ? body.phone : currentUser.phone;
    if (!rawPhone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }

    const phone = formatTogoPhone(rawPhone);
    if (!/^228\d{8}$/.test(phone)) {
      return NextResponse.json({ error: 'Numéro togolais invalide' }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { id: currentUser.id },
      select: { phoneOtpExpires: true },
    });
    if (isResendTooSoon(existing?.phoneOtpExpires ?? null)) {
      return NextResponse.json(
        { error: 'Patientez une minute avant de renvoyer un code' },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    await db.user.update({
      where: { id: currentUser.id },
      data: {
        phone,
        phoneVerified: false,
        phoneOtp: hashOtp(currentUser.id, otp),
        phoneOtpExpires: otpExpiry(),
      },
    });

    await sendSms(phone, `LocEasy : votre code de vérification est ${otp}. Valable 10 minutes.`);

    return NextResponse.json({
      success: true,
      message: 'Code envoyé par SMS',
      phone,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Impossible d\'envoyer le code' },
      { status: 500 }
    );
  }
}
