import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Lang, AppNotification } from '@/types';

export type { Lang } from '@/types';

export interface Filters {
  city: string;
  quartier: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

interface AppState {
  currentUser: User | null;
  login: (user: User) => void;
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

const defaultFilters: Filters = {
  city: '',
  quartier: '',
  type: '',
  minPrice: 0,
  maxPrice: 0,
  search: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'loceasy-store',
      partialize: (state) => ({ lang: state.lang }),
    }
  )
);
