import { NextRequest } from 'next/server';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const state: Record<string, any> = {};
  const db: Record<string, any> = {};

  db.$transaction = vi.fn(async (callback: (transaction: unknown) => unknown) => callback(db));

  db.listing = {
    findUnique: vi.fn(async ({ where }: any) =>
      state.listing?.id === where.id ? state.listing : null
    ),
    updateMany: vi.fn(async ({ where, data }: any) => {
      if (!state.listing || state.listing.id !== where.id) return { count: 0 };
      if (where.status && state.listing.status !== where.status) return { count: 0 };
      if (typeof where.available === 'boolean' && state.listing.available !== where.available) {
        return { count: 0 };
      }
      Object.assign(state.listing, data);
      return { count: 1 };
    }),
    update: vi.fn(async ({ where, data }: any) => {
      if (!state.listing || state.listing.id !== where.id) throw new Error('Listing not found');
      Object.assign(state.listing, data);
      return state.listing;
    }),
  };

  db.booking = {
    findMany: vi.fn(async ({ where }: any) => {
      const booking = state.booking;
      if (!booking || booking.listingId !== where.listingId) return [];
      return ['pending', 'accepted'].includes(booking.status)
        ? [{ status: booking.status, paymentStatus: booking.paymentStatus }]
        : [];
    }),
    create: vi.fn(async ({ data }: any) => {
      state.booking = {
        id: 'c123456789012345678901234',
        paymentStatus: 'pending',
        ...data,
      };
      return state.booking;
    }),
    findUnique: vi.fn(async ({ where, include }: any) => {
      if (!state.booking || state.booking.id !== where.id) return null;
      if (include?.listing && include?.tenant) {
        return { ...state.booking, listing: state.listing, tenant: state.tenant };
      }
      if (include?.listing) return { ...state.booking, listing: state.listing };
      return { ...state.booking };
    }),
    count: vi.fn(async ({ where }: any) => {
      if (!state.booking || state.booking.listingId !== where.listingId) return 0;
      if (where.id?.not === state.booking.id) return 0;
      return ['pending', 'accepted'].includes(state.booking.status) ? 1 : 0;
    }),
    updateMany: vi.fn(async ({ where, data }: any) => {
      if (!state.booking || state.booking.id !== where.id) return { count: 0 };
      if (where.status && state.booking.status !== where.status) return { count: 0 };
      if (where.paymentStatus?.not === 'paid' && state.booking.paymentStatus === 'paid') {
        return { count: 0 };
      }
      Object.assign(state.booking, data);
      return { count: 1 };
    }),
    update: vi.fn(async ({ where, data, include }: any) => {
      if (!state.booking || state.booking.id !== where.id) throw new Error('Booking not found');
      Object.assign(state.booking, data);
      return include?.listing && include?.tenant
        ? { ...state.booking, listing: state.listing, tenant: state.tenant }
        : { ...state.booking };
    }),
  };

  db.paymentLink = {
    findUnique: vi.fn(async () => state.paymentLink ?? null),
    findFirst: vi.fn(async () => state.paymentLink
      ? { ...state.paymentLink, booking: { status: state.booking.status } }
      : null),
    create: vi.fn(async ({ data }: any) => {
      state.paymentLink = { id: 'payment-link-test', ...data };
      return state.paymentLink;
    }),
    updateMany: vi.fn(async ({ where, data }: any) => {
      if (!state.paymentLink || state.paymentLink.id !== where.id) return { count: 0 };
      if (where.status && state.paymentLink.status !== where.status) return { count: 0 };
      Object.assign(state.paymentLink, data);
      return { count: 1 };
    }),
    update: vi.fn(async ({ where, data }: any) => {
      if (!state.paymentLink || state.paymentLink.id !== where.id) throw new Error('Payment link not found');
      Object.assign(state.paymentLink, data);
      return state.paymentLink;
    }),
  };

  db.payment = {
    upsert: vi.fn(async ({ create, update }: any) => {
      state.payment = { ...(state.payment ?? create), ...update };
      return state.payment;
    }),
  };
  db.notification = {
    create: vi.fn(async () => ({})),
    createMany: vi.fn(async () => ({ count: 2 })),
  };

  return { db, state, getCurrentUser: vi.fn() };
});

vi.mock('@/lib/db', () => ({ db: mocks.db }));
vi.mock('@/lib/session', () => ({ getCurrentUser: mocks.getCurrentUser }));

describe('booking to sandbox payment flow', () => {
  let createBooking: typeof import('./bookings/route').POST;
  let updateBooking: typeof import('./bookings/[id]/route').PATCH;
  let initiatePayment: typeof import('./payments/kagopay/initiate/route').POST;
  let fulfillPaidReference: typeof import('@/lib/kagopay-fulfillment').fulfillPaidReference;
  let paymentFetch: ReturnType<typeof vi.fn>;

  beforeAll(async () => {
    vi.stubEnv('PAYMENT_MODE', 'kagopay');
    vi.stubEnv('KAGOPAY_MODE', 'sandbox');
    vi.stubEnv('KAGOPAY_API_KEY', 'test-key-that-is-never-sent');

    paymentFetch = vi.fn(async (_url: string, options: RequestInit) => {
      const request = JSON.parse(String(options.body));
      return {
        ok: true,
        json: async () => ({
          status: 'pending',
          reference: request.reference,
          operator: 'yas',
          message: 'Simulation sandbox',
        }),
      };
    });
    vi.stubGlobal('fetch', paymentFetch);

    [
      { POST: createBooking },
      { PATCH: updateBooking },
      { POST: initiatePayment },
      { fulfillPaidReference },
    ] = await Promise.all([
      import('./bookings/route'),
      import('./bookings/[id]/route'),
      import('./payments/kagopay/initiate/route'),
      import('@/lib/kagopay-fulfillment'),
    ]);
  });

  beforeEach(() => {
    Object.assign(mocks.state, {
      listing: {
        id: 'cabcdefghijabcdefghijabcd',
        title: 'Studio test',
        landlordId: 'landlord-test',
        price: 30000,
        status: 'available',
        available: true,
      },
      tenant: { id: 'tenant-test', name: 'Locataire test', phone: '90000000' },
      user: { id: 'tenant-test', name: 'Locataire test', phone: '90000000', role: 'tenant' },
      booking: null,
      paymentLink: null,
      payment: null,
    });
    mocks.getCurrentUser.mockImplementation(async () => mocks.state.user);
    paymentFetch.mockClear();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('creates, accepts, charges in sandbox, and records a simulated payment', async () => {
    const createdResponse = await createBooking(new NextRequest('http://localhost/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        listingId: 'cabcdefghijabcdefghijabcd',
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        message: 'Demande de test',
      }),
    }));
    expect(createdResponse.status).toBe(201);
    const createdBooking = await createdResponse.json();
    expect(createdBooking.status).toBe('pending');
    expect(mocks.state.listing.status).toBe('viewing_in_progress');

    mocks.state.user = { id: 'landlord-test', name: 'Propriétaire test', role: 'landlord' };
    const acceptedResponse = await updateBooking(
      new NextRequest(`http://localhost/api/bookings/${createdBooking.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      }),
      { params: Promise.resolve({ id: createdBooking.id }) }
    );
    expect(acceptedResponse.status).toBe(200);
    expect((await acceptedResponse.json()).status).toBe('accepted');
    expect(mocks.state.listing.status).toBe('reserved');

    mocks.state.user = { id: 'tenant-test', name: 'Locataire test', phone: '90000000', role: 'tenant' };
    const paymentResponse = await initiatePayment(new NextRequest(
      'http://localhost/api/payments/kagopay/initiate',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookingId: createdBooking.id }),
      }
    ));
    expect(paymentResponse.status).toBe(200);
    const payment = await paymentResponse.json();
    expect(payment).toMatchObject({ amount: 2000, currency: 'XOF', status: 'pending', operator: 'yas' });
    expect(mocks.state.paymentLink.status).toBe('pending');
    expect(paymentFetch).toHaveBeenCalledTimes(1);
    expect(paymentFetch.mock.calls[0][0]).toBe('https://sandbox.kagoservices.com/api/v1/initiate.php');
    expect(JSON.parse(String(paymentFetch.mock.calls[0][1].body))).toMatchObject({
      phone: '22890000000',
      amount: 2000,
      reference: payment.reference,
    });

    const fulfillment = await fulfillPaidReference(payment.reference, {
      operator: 'yas',
      phone: '22890000000',
    });
    expect(fulfillment).toMatchObject({ ok: true, already: false, bookingId: createdBooking.id });
    expect(mocks.state.booking.paymentStatus).toBe('paid');
    expect(mocks.state.paymentLink.status).toBe('paid');
    expect(mocks.state.payment).toMatchObject({ status: 'paid', method: 'yas_togo' });
    expect(mocks.state.listing.status).toBe('rented');
  });
});
