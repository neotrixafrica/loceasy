import type { PaymentInput, PaymentVerifyInput, BookingInput } from '@/types';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface ApiOptions<T = unknown> extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod;
  body?: T;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(
  input: string | URL,
  options: ApiOptions = {}
): Promise<Response> {
  const { method = 'GET', body, headers, ...rest } = options;

  const init: RequestInit = {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    ...rest,
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  return fetch(input, init);
}

export async function apiGet<R = unknown>(input: string | URL, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<R> {
  const res = await apiFetch(input, { ...init, method: 'GET' });
  if (!res.ok) throw new ApiError(`GET ${input} failed`, res.status, await res.json().catch(() => null));
  return res.json();
}

export async function apiPost<R = unknown, B = unknown>(input: string | URL, body: B, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<R> {
  const res = await apiFetch(input, { ...init, method: 'POST', body });
  if (!res.ok) throw new ApiError(`POST ${input} failed`, res.status, await res.json().catch(() => null));
  return res.json();
}

export async function apiPatch<R = unknown, B = unknown>(input: string | URL, body: B, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<R> {
  const res = await apiFetch(input, { ...init, method: 'PATCH', body });
  if (!res.ok) throw new ApiError(`PATCH ${input} failed`, res.status, await res.json().catch(() => null));
  return res.json();
}

export async function apiDelete<R = unknown>(input: string | URL, init?: Omit<ApiOptions, 'method' | 'body'>): Promise<R> {
  const res = await apiFetch(input, { ...init, method: 'DELETE' });
  if (!res.ok) throw new ApiError(`DELETE ${input} failed`, res.status, await res.json().catch(() => null));
  return res.json();
}

// Typed feature helpers
export const api = {
  auth: {
    login: (email: string, password: string) => apiPost<{ id: string; email: string; name: string; phone?: string | null; role: string; avatar?: string | null; verified: boolean; city?: string | null }>('/api/auth/login', { email, password }),
    logout: () => apiPost<unknown>('/api/auth/logout', {}),
    register: (data: { name: string; email: string; password: string; phone?: string; role: string }) => apiPost<unknown>('/api/auth/register', data),
    me: () => apiGet<{ id: string; email: string; name: string; phone?: string | null; role: string; avatar?: string | null; verified: boolean; city?: string | null }>('/api/auth/me'),
  },
  listings: {
    list: (params?: { city?: string; quartier?: string; type?: string; minPrice?: number; maxPrice?: number; search?: string }) => {
      const search = new URLSearchParams();
      if (params?.city) search.set('city', params.city);
      if (params?.quartier) search.set('quartier', params.quartier);
      if (params?.type) search.set('type', params.type);
      if (params?.minPrice) search.set('minPrice', String(params.minPrice));
      if (params?.maxPrice) search.set('maxPrice', String(params.maxPrice));
      if (params?.search) search.set('search', params.search);
      return apiGet<unknown[]>(`/api/listings?${search.toString()}`);
    },
    get: (id: string) => apiGet<unknown>(`/api/listings/${id}`),
    create: (data: unknown) => apiPost<unknown>('/api/listings', data),
  },
  bookings: {
    list: () => apiGet<unknown[]>('/api/bookings'),
    create: (data: BookingInput) => apiPost<unknown>('/api/bookings', data),
    update: (id: string, data: { status?: string; paymentStatus?: string }) => apiPatch<unknown>(`/api/bookings/${id}`, data),
  },
  favorites: {
    list: () => apiGet<unknown[]>('/api/favorites'),
    toggle: (listingId: string) => apiPost<unknown>('/api/favorites', { listingId }),
  },
  messages: {
    list: () => apiGet<unknown[]>('/api/messages'),
    send: (data: { receiverId: string; content: string; listingId?: string }) => apiPost<unknown>('/api/messages', data),
  },
  payments: {
    create: (data: PaymentInput) => apiPost<unknown>('/api/payments', data),
    verify: (data: PaymentVerifyInput) => apiPost<unknown>('/api/payments/verify', data),
  },
};
