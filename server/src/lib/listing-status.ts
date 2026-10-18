import { db } from './db';
import type { ListingStatus, PaymentStatus, BookingStatus } from '@prisma/client';

export type BookingSnapshot = {
  status: BookingStatus;
  paymentStatus: PaymentStatus;
};

export function deriveListingStatus(bookings: BookingSnapshot[]): ListingStatus {
  const active = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted');
  if (active.some((b) => b.status === 'accepted' && b.paymentStatus === 'paid')) {
    return 'rented';
  }
  if (active.some((b) => b.status === 'accepted')) {
    return 'reserved';
  }
  if (active.some((b) => b.status === 'pending')) {
    return 'viewing_in_progress';
  }
  return 'available';
}

export function isListingPublic(status: ListingStatus): boolean {
  return status === 'available' || status === 'viewing_in_progress';
}

export function isListingBookable(status: ListingStatus): boolean {
  return status === 'available';
}

export function availableFlag(status: ListingStatus): boolean {
  return status === 'available';
}

export async function refreshListingFromBookings(listingId: string): Promise<ListingStatus> {
  const bookings = await db.booking.findMany({
    where: { listingId, status: { in: ['pending', 'accepted'] } },
    select: { status: true, paymentStatus: true },
  });
  const status = deriveListingStatus(bookings);
  await db.listing.update({
    where: { id: listingId },
    data: { status, available: availableFlag(status) },
  });
  return status;
}

export async function assertListingBookable(listingId: string) {
  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, landlordId: true, status: true, price: true },
  });
  if (!listing) {
    return { ok: false as const, error: 'Logement introuvable', status: 404 };
  }
  if (!isListingBookable(listing.status)) {
    const message =
      listing.status === 'viewing_in_progress'
        ? 'Ce logement est déjà en discussion avec un candidat'
        : 'Ce logement n\'est plus disponible';
    return { ok: false as const, error: message, status: 409 };
  }
  const active = await db.booking.count({
    where: { listingId, status: { in: ['pending', 'accepted'] } },
  });
  if (active > 0) {
    return {
      ok: false as const,
      error: 'Ce logement est déjà en discussion avec un candidat',
      status: 409,
    };
  }
  return { ok: true as const, listing };
}
