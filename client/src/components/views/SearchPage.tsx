'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t, TOGO_CITIES, TOGO_QUARTIERS } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/shared/ListingCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal, X, Map, LayoutGrid } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/shared/MapView'), {
  ssr: false,
  loading: () => (
    <div className="bg-emerald-50 border rounded-xl h-full flex items-center justify-center">
      <div className="text-center">
        <Map className="h-8 w-8 text-emerald-600 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-emerald-700">...</p>
      </div>
    </div>
  ),
});

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  images: string[];
  area: number | null;
  rooms: number;
  amenities: string[];
  landlord: { id: string; name: string };
  latitude?: number | null;
  longitude?: number | null;
}

export function SearchPage() {
  const { lang, filters, setFilters, resetFilters } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showMap, setShowMap] = useState(false);

  const quartiers = filters.city ? (TOGO_QUARTIERS[filters.city] || []) : [];

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.city) params.set('city', filters.city);
      if (filters.quartier) params.set('quartier', filters.quartier);
      if (filters.type) params.set('type', filters.type);
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
      if (filters.search) params.set('search', filters.search);

      const res = await apiFetch(`/api/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedListings = [...listings].sort((a, b) => {
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'priceDesc') return b.price - a.price;
    return 0; // recent is already handled by default order
  });

  const activeFilterCount = [
    filters.city,
    filters.quartier,
    filters.type,
    filters.minPrice > 0,
    filters.maxPrice > 0,
    filters.search,
  ].filter(Boolean).length;

  const mapMarkers = listings
    .filter((l) => l.latitude && l.longitude)
    .map((l) => ({
      latitude: l.latitude as number,
      longitude: l.longitude as number,
      title: l.title,
      price: l.price,
      type: l.type,
      onClick: () => {
        apiFetch(`/api/listings/${l.id}`)
          .then((res) => res.json())
          .then((data) => router.push(`/listing/${data.id}`))
          .catch(() => {});
      },
    }));

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('search.title', lang)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? t('common.loading', lang) : `${listings.length} ${t('search.results', lang)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('search.filters', lang)}
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-700 text-white text-[10px] rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
          {/* Map toggle */}
          <Button
            variant={showMap ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="hidden md:flex"
          >
            <Map className="h-4 w-4 mr-1.5" />
            {t('search.map', lang)}
          </Button>
        </div>
      </div>

      {/* Quick Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('hero.search.placeholder', lang)}
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-card border rounded-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('search.city', lang)}
              </label>
              <Select
                value={filters.city}
                onValueChange={(val) => setFilters({ city: val === 'all' ? '' : val, quartier: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.city.all', lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.city.all', lang)}</SelectItem>
                  {TOGO_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('search.quartier', lang)}
              </label>
              <Select
                value={filters.quartier}
                onValueChange={(val) => setFilters({ quartier: val === 'all' ? '' : val })}
                disabled={!filters.city}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.quartier.all', lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.quartier.all', lang)}</SelectItem>
                  {quartiers.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('search.type', lang)}
              </label>
              <Select
                value={filters.type}
                onValueChange={(val) => setFilters({ type: val === 'all' ? '' : val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('search.type.all', lang)} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('search.type.all', lang)}</SelectItem>
                  <SelectItem value="chambre">{t('type.chambre', lang)}</SelectItem>
                  <SelectItem value="studio">{t('type.studio', lang)}</SelectItem>
                  <SelectItem value="appartement">{t('type.appartement', lang)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('search.price.min', lang)} (FCFA)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ minPrice: Number(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                {t('search.price.max', lang)} (FCFA)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ maxPrice: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => { resetFilters(); }}
              >
                <X className="h-3 w-3 mr-1" />
                {t('search.reset', lang)}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">{t('search.sort', lang)}:</span>
        <Button
          variant={sortBy === 'recent' ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => setSortBy('recent')}
        >
          {t('search.sort.recent', lang)}
        </Button>
        <Button
          variant={sortBy === 'priceAsc' ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => setSortBy('priceAsc')}
        >
          {t('search.sort.priceAsc', lang)}
        </Button>
        <Button
          variant={sortBy === 'priceDesc' ? 'default' : 'outline'}
          size="sm"
          className="text-xs"
          onClick={() => setSortBy('priceDesc')}
        >
          {t('search.sort.priceDesc', lang)}
        </Button>
      </div>

      {/* Results with optional Map */}
      <div className={showMap ? 'flex gap-4 h-[calc(100vh-16rem)]' : ''}>
        {/* Results grid */}
        <div className={showMap ? 'flex-1 overflow-y-auto pr-2' : ''}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border rounded-xl overflow-hidden animate-pulse">
                  <div className="bg-muted h-48" />
                  <div className="p-4 space-y-3">
                    <div className="bg-muted h-4 rounded w-3/4" />
                    <div className="bg-muted h-3 rounded w-1/2" />
                    <div className="bg-muted h-6 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedListings.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('search.noResults', lang)}</h3>
              <p className="text-muted-foreground text-sm">{t('search.noResults.desc', lang)}</p>
            </div>
          ) : (
            <div className={`grid gap-4 ${showMap ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {sortedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>

        {/* Map panel (desktop only) */}
        {showMap && (
          <div className="hidden md:block w-1/2 lg:w-2/5 flex-shrink-0 rounded-xl overflow-hidden border">
            {mapMarkers.length > 0 ? (
              <MapView
                latitude={0}
                longitude={0}
                markers={mapMarkers}
                className="h-full"
              />
            ) : (
              <div className="h-full bg-emerald-50 flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm text-emerald-700">
                    {lang === 'fr' ? 'Aucune carte disponible pour ces résultats' : 'No map data for these results'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
