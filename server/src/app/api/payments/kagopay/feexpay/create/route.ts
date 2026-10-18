import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Récupérer la réservation
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: true,
        tenant: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le locataire
    if (booking.tenantId !== currentUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Vérifier si un lien de paiement existe déjà
    const existingPaymentLink = await db.paymentLink.findUnique({
      where: { bookingId },
    });

    if (existingPaymentLink && existingPaymentLink.status === 'paid') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Créer ou mettre à jour le lien de paiement
    const paymentLink = await db.paymentLink.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.listing.price,
        currency: 'XOF',
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
      update: {
        status: 'pending',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      paymentLinkId: paymentLink.id,
      amount: paymentLink.amount,
      currency: paymentLink.currency,
      expiresAt: paymentLink.expiresAt,
    });
  } catch (error) {
    console.error('Error creating FeexPay payment link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
