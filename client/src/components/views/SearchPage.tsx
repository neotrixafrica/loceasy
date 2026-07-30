'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { TOGO_CITIES, TOGO_QUARTIERS } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/shared/ListingCard';
import { Search, Map, LayoutGrid, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/shared/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Chargement de la carte...</p>
    </div>
  ),
});

interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  images: string[];
  latitude?: number | null;
  longitude?: number | null;
  landlord?: { id: string; name: string; verified?: boolean };
}

export function SearchPage() {
  const { filters, setFilters, resetFilters } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'priceAsc' | 'priceDesc'>('recent');

  const quartiers = filters.city ? (TOGO_QUARTIERS[filters.city] || []) : [];

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.quartier) params.set('quartier', filters.quartier);
      if (filters.type) params.set('type', filters.type);
      if (filters.minPrice > 0) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice > 0) params.set('maxPrice', String(filters.maxPrice));
      if (filters.search) params.set('search', filters.search);

      const res = await apiFetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    return 0;
  });

  const mapMarkers = listings
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      latitude: l.latitude as number,
      longitude: l.longitude as number,
      title: l.title,
      price: l.price,
      type: l.type,
      onClick: () => router.push(`/listing/${l.id}`),
    }));

  const activeFiltersCount = [
    filters.city,
    filters.quartier,
    filters.type,
    filters.minPrice > 0,
    filters.maxPrice > 0,
    filters.search,
  ].filter(Boolean).length;

  const gridCols = cn(
    'grid gap-4 sm:gap-5',
    showMap
      ? 'grid-cols-1 sm:grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
  );

  return (
    <div className="flex-1 bg-white">
      {/* Sticky filter bar */}
      <div className="sticky top-20 z-30 border-b bg-white py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-1 scrollbar-hide">
          {/* Search */}
          <div className="relative min-w-[180px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Rechercher..."
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-600"
            />
          </div>

          {/* City */}
          <div className="relative min-w-[150px]">
            <select
              value={filters.city || 'all'}
              onChange={(e) => setFilters({ city: e.target.value === 'all' ? '' : e.target.value, quartier: '' })}
              className="h-10 w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-600"
            >
              <option value="all">Toutes les villes</option>
              {TOGO_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Quartier */}
          <div className="relative min-w-[150px]">
            <select
              value={filters.quartier || 'all'}
              onChange={(e) => setFilters({ quartier: e.target.value === 'all' ? '' : e.target.value })}
              disabled={!filters.city}
              className="h-10 w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="all">Tous les quartiers</option>
              {quartiers.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Type */}
          <div className="relative min-w-[150px]">
            <select
              value={filters.type || 'all'}
              onChange={(e) => setFilters({ type: e.target.value === 'all' ? '' : e.target.value })}
              className="h-10 w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-600"
            >
              <option value="all">Tous les types</option>
              <option value="chambre">Chambre</option>
              <option value="studio">Studio</option>
              <option value="appartement">Appartement</option>
              <option value="maison">Maison</option>
              <option value="bureau">Bureau</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Price min */}
          <input
            type="number"
            min={0}
            value={filters.minPrice || ''}
            onChange={(e) => setFilters({ minPrice: Number(e.target.value) || 0 })}
            placeholder="Prix min"
            className="h-10 w-28 rounded-full border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-emerald-600"
          />

          {/* Price max */}
          <input
            type="number"
            min={0}
            value={filters.maxPrice || ''}
            onChange={(e) => setFilters({ maxPrice: Number(e.target.value) || 0 })}
            placeholder="Prix max"
            className="h-10 w-28 rounded-full border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-emerald-600"
          />

          {/* Reset */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Effacer
            </button>
          )}

          {/* Map/List toggle (desktop) */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={cn(
              'hidden md:flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition',
              showMap
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
          >
            {showMap ? <LayoutGrid className="h-4 w-4" /> : <Map className="h-4 w-4" />}
            {showMap ? 'Liste' : 'Carte'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Header + sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
              {loading ? 'Recherche...' : `${listings.length} logements trouvés`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {[
              { key: 'recent', label: 'Récent' },
              { key: 'priceAsc', label: 'Prix croissant' },
              { key: 'priceDesc', label: 'Prix décroissant' },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key as typeof sortBy)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                  sortBy === s.key
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results + desktop map */}
        <div className={cn('flex gap-5', showMap ? 'flex-col md:flex-row' : '')}>
          <div className={cn('flex-1', showMap ? 'md:w-1/2' : '')}>
            {loading ? (
              <div className={gridCols}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="aspect-[20/19] animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-4 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : sortedListings.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <h3 className="font-medium text-slate-900">Aucun résultat</h3>
                <p className="text-sm text-slate-500">Modifiez vos filtres.</p>
              </div>
            ) : (
              <div className={gridCols}>
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>

          {/* Desktop map panel */}
          {showMap && (
            <div className="sticky top-40 hidden h-[calc(100vh-11rem)] w-full rounded-2xl border border-slate-100 bg-white shadow-sm md:block md:w-1/2">
              {mapMarkers.length > 0 ? (
                <MapView
                  latitude={0}
                  longitude={0}
                  markers={mapMarkers}
                  className="h-full w-full rounded-2xl"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-50">
                  <p className="text-sm text-slate-500">Aucune position pour ces résultats.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating map toggle */}
      <div className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 md:hidden">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-slate-800"
        >
          {showMap ? <LayoutGrid className="h-4 w-4" /> : <Map className="h-4 w-4" />}
          {showMap ? 'Liste' : 'Carte'}
        </button>
      </div>

      {/* Mobile map bottom sheet */}
      {showMap && (
        <div className="fixed inset-x-0 bottom-0 z-40 h-[70vh] rounded-t-2xl bg-white shadow-2xl md:hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-medium text-slate-900">Carte</span>
            <button
              onClick={() => setShowMap(false)}
              className="rounded-full p-2 hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="h-[calc(70vh-3.5rem)] w-full p-4">
            {mapMarkers.length > 0 ? (
              <MapView
                latitude={0}
                longitude={0}
                markers={mapMarkers}
                className="h-full w-full rounded-2xl"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-50">
                <p className="text-sm text-slate-500">Aucune position pour ces résultats.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
