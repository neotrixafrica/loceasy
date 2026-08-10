'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { t, TOGO_CITIES, TOGO_QUARTIERS } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/shared/ListingCard';
import { Search, Map, LayoutGrid, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { Listing, Lang } from '@/types';

const MapView = dynamic(() => import('@/components/shared/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50">
      <p className="text-sm text-slate-500">Chargement de la carte...</p>
    </div>
  ),
});

const TYPES = ['chambre', 'studio', 'appartement', 'maison', 'bureau'] as const;
type SortBy = 'recent' | 'priceAsc' | 'priceDesc';

export function SearchPage() {
  const { lang, filters, setFilters, resetFilters } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('recent');

  const quartiers = useMemo(
    () => (filters.city ? TOGO_QUARTIERS[filters.city] || [] : []),
    [filters.city]
  );

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listings.list({
        city: filters.city,
        quartier: filters.quartier,
        type: filters.type,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice > 0 ? filters.maxPrice : undefined,
        search: filters.search,
      });
      setListings(data as Listing[]);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(fetchListings, 250);
    return () => clearTimeout(timer);
  }, [fetchListings]);

  const sortedListings = useMemo(() => {
    const copy = [...listings];
    if (sortBy === 'priceAsc') return copy.sort((a, b) => a.price - b.price);
    if (sortBy === 'priceDesc') return copy.sort((a, b) => b.price - a.price);
    return copy;
  }, [listings, sortBy]);

  const mapMarkers = useMemo(
    () =>
      listings
        .filter((l) => l.latitude && l.longitude)
        .map((l) => ({
          latitude: l.latitude as number,
          longitude: l.longitude as number,
          title: l.title,
          price: l.price,
          type: l.type,
          onClick: () => router.push(`/listing/${l.id}`),
        })),
    [listings, router]
  );

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

  const updateFilter = (key: keyof typeof filters, value: string | number) => {
    if (key === 'city') {
      setFilters({ city: value as string, quartier: '' });
    } else {
      setFilters({ [key]: value });
    }
  };

  return (
    <div className="flex-1 bg-white">
      {/* Sticky filter bar */}
      <div className="sticky top-20 z-30 border-b bg-white py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-1 scrollbar-hide">
          <SearchInput value={filters.search} onChange={(v) => updateFilter('search', v)} lang={lang} />
          <Select
            value={filters.city || 'all'}
            onChange={(v) => updateFilter('city', v === 'all' ? '' : v)}
            options={[{ label: t('search.city.all', lang), value: 'all' }, ...TOGO_CITIES.map((c) => ({ label: c, value: c }))]}
          />
          <Select
            value={filters.quartier || 'all'}
            onChange={(v) => updateFilter('quartier', v === 'all' ? '' : v)}
            disabled={!filters.city}
            options={[{ label: t('search.quartier.all', lang), value: 'all' }, ...quartiers.map((q) => ({ label: q, value: q }))]}
          />
          <Select
            value={filters.type || 'all'}
            onChange={(v) => updateFilter('type', v === 'all' ? '' : v)}
            options={[
              { label: t('search.type.all', lang), value: 'all' },
              ...TYPES.map((type) => ({ label: t('type.' + type, lang), value: type })),
            ]}
          />
          <PriceInput
            value={filters.minPrice || ''}
            onChange={(v) => updateFilter('minPrice', v ? Number(v) : 0)}
            placeholder={t('search.price.min', lang)}
          />
          <PriceInput
            value={filters.maxPrice || ''}
            onChange={(v) => updateFilter('maxPrice', v ? Number(v) : 0)}
            placeholder={t('search.price.max', lang)}
          />

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex h-10 shrink-0 items-center gap-1 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              {t('search.reset', lang)}
            </button>
          )}

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
            {showMap ? t('search.list', lang) : t('search.map', lang)}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Header + sort */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
            {loading ? t('search.loading', lang) : `${listings.length} ${t('search.results', lang)}`}
          </h1>
          <div className="flex items-center gap-2">
            {[
              { key: 'recent' as SortBy, label: t('search.sort.recent', lang) },
              { key: 'priceAsc' as SortBy, label: t('search.sort.priceAsc', lang) },
              { key: 'priceDesc' as SortBy, label: t('search.sort.priceDesc', lang) },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
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
              <ListingGridSkeleton gridCols={gridCols} />
            ) : sortedListings.length === 0 ? (
              <div className="py-16 text-center">
                <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <h3 className="font-medium text-slate-900">{t('search.noResults', lang)}</h3>
                <p className="text-sm text-slate-500">{t('search.noResults.desc', lang)}</p>
              </div>
            ) : (
              <div className={gridCols}>
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>

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
                  <p className="text-sm text-slate-500">{t('search.noMarkers', lang)}</p>
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
          {showMap ? t('search.list', lang) : t('search.map', lang)}
        </button>
      </div>

      {/* Mobile map bottom sheet */}
      {showMap && (
        <div className="fixed inset-x-0 bottom-0 z-40 h-[70vh] rounded-t-2xl bg-white shadow-2xl md:hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-medium text-slate-900">{t('search.map', lang)}</span>
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
                <p className="text-sm text-slate-500">{t('search.noMarkers', lang)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchInput({ value, onChange, lang }: { value: string; onChange: (v: string) => void; lang: Lang }) {
  return (
    <div className="relative min-w-[180px] flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('search.keyword', lang)}
        className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-emerald-600"
      />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="relative min-w-[150px]">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 w-full cursor-pointer appearance-none rounded-full border border-slate-200 bg-white pl-4 pr-9 text-sm text-slate-900 outline-none focus:border-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
}: {
  value: string | number;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-28 rounded-full border border-slate-200 px-4 text-sm text-slate-900 outline-none focus:border-emerald-600"
    />
  );
}

function ListingGridSkeleton({ gridCols }: { gridCols: string }) {
  return (
    <div className={gridCols}>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[20/19] animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
