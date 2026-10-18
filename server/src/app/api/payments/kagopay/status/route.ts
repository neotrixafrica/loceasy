import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import { checkKagoPayStatus } from '@/lib/kagopay';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json({ error: 'Reference required' }, { status: 400 });
    }

    const paymentLink = await db.paymentLink.findFirst({
      where: { feexpayId: reference },
      include: { booking: { select: { tenantId: true } } },
    });
    if (!paymentLink) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (paymentLink.booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = await checkKagoPayStatus(reference);
    if (status.status === 'failed') {
      await db.paymentLink.updateMany({
        where: { id: paymentLink.id, feexpayId: reference, status: 'pending' },
        data: { status: 'failed' },
      });
    }
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error checking KagoPay status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
