import { create } from 'zustand';

export type Lang = 'fr' | 'en' | 'ee' | 'kab';

interface Filters {
  city: string;
  quartier: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

interface AppState {
  currentUser: {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    avatar: string | null;
    verified: boolean;
    city: string | null;
  } | null;
  login: (user: AppState['currentUser']) => void;
  logout: () => void;

  lang: Lang;
  setLang: (lang: Lang) => void;

  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
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

const defaultFilters: Filters = {
  city: '',
  quartier: '',
  type: '',
  minPrice: 0,
  maxPrice: 0,
  search: '',
};

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  lang: 'fr',
  setLang: (lang) => set({ lang }),

  filters: { ...defaultFilters },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),

  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID?.() || Date.now().toString(),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ].slice(0, 50),
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),
}));
