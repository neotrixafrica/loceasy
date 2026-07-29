import { create } from 'zustand';

export type View =
  | 'home'
  | 'search'
  | 'listing-detail'
  | 'login'
  | 'register'
  | 'landlord-dashboard'
  | 'add-listing'
  | 'messages'
  | 'conversation'
  | 'favorites'
  | 'profile'
  | 'booking-form';

export type Lang = 'fr' | 'en';

interface Filters {
  city: string;
  quartier: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  search: string;
}

interface AppState {
  currentView: View;
  previousView: View | null;
  navigationData: Record<string, unknown>;
  navigate: (view: View, data?: Record<string, unknown>) => void;
  goBack: () => void;

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
  currentView: 'home',
  previousView: null,
  navigationData: {},
  navigate: (view, data = {}) =>
    set((state) => ({
      currentView: view,
      previousView: state.currentView,
      navigationData: data,
    })),
  goBack: () =>
    set((state) => ({
      currentView: state.previousView || 'home',
      previousView: null,
      navigationData: {},
    })),

  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null, currentView: 'home' }),

  lang: 'fr',
  setLang: (lang) => set({ lang }),

  filters: { ...defaultFilters },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
}));
