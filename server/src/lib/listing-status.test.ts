import { describe, it, expect } from 'vitest';
import {
  deriveListingStatus,
  isListingBookable,
  isListingPublic,
  availableFlag,
} from './listing-status';

describe('deriveListingStatus', () => {
  it('is available with no active bookings', () => {
    expect(deriveListingStatus([])).toBe('available');
    expect(
      deriveListingStatus([{ status: 'cancelled', paymentStatus: 'pending' }])
    ).toBe('available');
  });

  it('is viewing when a request is pending', () => {
    expect(
      deriveListingStatus([{ status: 'pending', paymentStatus: 'pending' }])
    ).toBe('viewing_in_progress');
  });

  it('is reserved when landlord accepted unpaid', () => {
    expect(
      deriveListingStatus([{ status: 'accepted', paymentStatus: 'pending' }])
    ).toBe('reserved');
  });

  it('is rented when accepted and paid', () => {
    expect(
      deriveListingStatus([{ status: 'accepted', paymentStatus: 'paid' }])
    ).toBe('rented');
  });
});

describe('listing visibility', () => {
  it('keeps viewing listings public but not bookable', () => {
    expect(isListingPublic('viewing_in_progress')).toBe(true);
    expect(isListingBookable('viewing_in_progress')).toBe(false);
    expect(availableFlag('viewing_in_progress')).toBe(false);
  });

  it('hides reserved and rented from booking', () => {
    expect(isListingBookable('reserved')).toBe(false);
    expect(isListingPublic('rented')).toBe(false);
  });
});
