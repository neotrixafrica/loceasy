export type Lang = 'fr' | 'en' | 'ee' | 'kab';

export type UserRole = 'tenant' | 'landlord';

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod = 'flooz' | 'tmoney' | 'wave' | 'orange_money' | 'cash';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  verified: boolean;
  city?: string | null;
}

export interface Landlord {
  id: string;
  name: string;
  phone?: string | null;
  city?: string | null;
  verified?: boolean;
  avatar?: string | null;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  city: string;
  quartier?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  rooms: number;
  area?: number | null;
  amenities: string[];
  images: string[];
  rules?: string | null;
  available: boolean;
  landlordId: string;
  landlord?: Landlord;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  startDate: string;
  endDate: string;
  message?: string | null;
  tenantId: string;
  listingId: string;
  listing?: Listing;
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  phone: string;
  status: PaymentStatus;
  transactionRef?: string | null;
  bookingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  listingId: string;
  tenantId: string;
  tenant?: Pick<User, 'id' | 'name' | 'avatar'>;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  listingId?: string | null;
  read: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  listing?: Listing;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: 'booking' | 'message' | 'system';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  phone?: string;
  role: UserRole;
}

export interface BookingInput {
  listingId: string;
  startDate: string;
  endDate: string;
  message?: string;
}

export interface PaymentInput {
  bookingId: string;
  method: PaymentMethod;
  phone: string;
  amount: number;
}

export interface PaymentVerifyInput {
  paymentId: string;
  code: string;
}
