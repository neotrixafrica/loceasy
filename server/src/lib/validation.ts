import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['tenant', 'landlord']),
});

export const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  type: z.enum(['chambre', 'studio', 'appartement', 'maison', 'bureau']),
  city: z.string().min(1, 'City is required'),
  quartier: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  rooms: z.number().int().positive().optional().nullable(),
  area: z.number().positive().optional().nullable(),
  amenities: z.array(z.string()).optional().default([]),
  images: z.array(z.string().url('Image must be a valid URL')).optional().default([]),
  rules: z.string().optional().nullable(),
});

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date, expected YYYY-MM-DD');

export const bookingSchema = z.object({
  startDate: dateString,
  endDate: dateString,
  message: z.string().optional().nullable(),
  listingId: z.string().cuid('Invalid listing ID'),
});

export const bookingStatusSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected', 'cancelled']),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  receiverId: z.string().cuid('Invalid receiver ID'),
  listingId: z.string().cuid('Invalid listing ID').optional().nullable(),
});

export const favoriteSchema = z.object({
  listingId: z.string().cuid('Invalid listing ID'),
});
