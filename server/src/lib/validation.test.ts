import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, listingSchema, bookingSchema, messageSchema } from './validation';

const validCuid = 'cmq1d6xnw0000wktk6gth1j2w';
const validEmail = 'test@example.com';

describe('validation', () => {
  it('login requires valid email and password', () => {
    expect(loginSchema.safeParse({ email: validEmail, password: '123456' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'invalid', password: '123' }).success).toBe(false);
  });

  it('register requires role and name', () => {
    expect(registerSchema.safeParse({
      email: validEmail,
      password: 'password123',
      name: 'Test',
      role: 'tenant',
    }).success).toBe(true);
    expect(registerSchema.safeParse({
      email: validEmail,
      password: 'password123',
      name: 'T',
      role: 'tenant',
    }).success).toBe(false);
  });

  it('listing requires title, description, price, type, city', () => {
    expect(listingSchema.safeParse({
      title: 'Studio test',
      description: 'Description suffisamment longue',
      price: 50000,
      type: 'chambre',
      city: 'Lomé',
    }).success).toBe(true);
    expect(listingSchema.safeParse({
      title: 'S',
      description: 'Court',
      price: -1,
      type: 'chambre',
      city: '',
    }).success).toBe(false);
  });

  it('booking requires dates and listingId', () => {
    expect(bookingSchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      listingId: validCuid,
    }).success).toBe(true);
    expect(bookingSchema.safeParse({
      startDate: '2026/01/01',
      endDate: '2026-01-31',
      listingId: validCuid,
    }).success).toBe(false);
    expect(bookingSchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      listingId: 'not-a-cuid',
    }).success).toBe(false);
  });

  it('message requires content and receiverId', () => {
    expect(messageSchema.safeParse({
      content: 'Hello',
      receiverId: validCuid,
      listingId: validCuid,
    }).success).toBe(true);
    expect(messageSchema.safeParse({
      content: '',
      receiverId: validCuid,
    }).success).toBe(false);
    expect(messageSchema.safeParse({
      content: 'Hello',
      receiverId: 'bad-id',
    }).success).toBe(false);
  });
});
