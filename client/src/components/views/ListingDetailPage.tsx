'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Heart,
  MapPin,
  BedDouble,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Share2,
  MessageCircle,
  CalendarDays,
  User,
  Star,
  Home,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import type { Listing } from '@/types';

const MapView = dynamic(() => import('@/components/shared/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-muted">
      <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
});

const typeLabels: Record<string, string> = {
  chambre: 'Chambre',
  studio: 'Studio',
  appartement: 'Appartement',
  maison: 'Maison',
  bureau: 'Bureau',
};

export function ListingDetailPage({
  listing: initialListing,
  listingId,
}: {
  listing?: Listing;
  listingId?: string;
}) {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | undefined>(initialListing);
  const [loading, setLoading] = useState(!initialListing && !!listingId);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviewStats, setReviewStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    if (initialListing) {
      setListing(initialListing);
      setLoading(false);
      return;
    }
    if (!listingId) return;
    setLoading(true);
    apiGet<Listing>(`/api/listings/${listingId}`)
      .then((data) => setListing(data))
      .catch(() => setListing(undefined))
      .finally(() => setLoading(false));
  }, [initialListing, listingId]);

  useEffect(() => {
    if (currentUser && listing) {
      apiGet<Listing[]>(`/api/favorites?userId=${currentUser.id}`)
        .then((favs) => setIsFavorite(favs.some((f) => f.id === listing.id)))
        .catch(() => {});
    }
  }, [currentUser, listing]);

  useEffect(() => {
    if (!listing?.id) return;
    apiGet<{ average: number; count: number }>(`/api/reviews?listingId=${listing.id}`)
      .then((data) => setReviewStats({ average: data.average, count: data.count }))
      .catch(() => {});
  }, [listing]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Logement introuvable.</p>
      </div>
    );
  }

  const images = listing.images || [];

  const toggleFavorite = async () => {
    if (!currentUser || !listing) {
      router.push('/login');
      return;
    }
    try {
      if (isFavorite) {
        await apiDelete(`/api/favorites?userId=${currentUser.id}&listingId=${listing.id}`);
        setIsFavorite(false);
      } else {
        await apiPost('/api/favorites', { listingId: listing.id });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url });
      } catch {
        // ignore
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleContact = () => {
    if (!currentUser || !listing.landlord) {
      router.push('/login');
      return;
    }
    router.push(`/messages/${listing.landlord.id}`);
  };

  const handleBooking = () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }
    router.push(`/booking-form?listingId=${listing.id}`);
  };

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="flex-1 bg-card pb-20 md:pb-0">
      {/* Mobile top bar */}
      <div className="sticky top-20 z-30 flex items-center justify-between border-b bg-card px-4 py-2 md:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-foreground">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="rounded-full p-2 hover:bg-muted">
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={toggleFavorite} className="rounded-full p-2 hover:bg-muted">
            <Heart className={cn('h-5 w-5', isFavorite ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-0 md:px-6 lg:px-8">
        {/* Mobile image carousel */}
        <div className="relative h-72 w-full overflow-hidden md:hidden">
          {images.length > 0 ? (
            <img
              src={images[currentImage]}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Home className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 shadow">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 shadow">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={cn('h-2 w-2 rounded-full transition', i === currentImage ? 'bg-card' : 'bg-card/60')}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Desktop image gallery */}
        {images.length > 0 ? (
          <div className="hidden h-[420px] w-full gap-2 py-6 md:grid md:grid-cols-2 md:grid-rows-2">
            <div className="relative col-span-1 row-span-2 overflow-hidden rounded-l-2xl bg-muted">
              <img
                src={images[0]}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
            </div>
            {images[1] && (
              <div className="relative overflow-hidden bg-muted">
                <img src={images[1]} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            {images[2] && (
              <div className="relative overflow-hidden rounded-tr-2xl bg-muted">
                <img src={images[2]} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        ) : (
          <div className="hidden h-[420px] w-full items-center justify-center rounded-2xl bg-muted md:flex">
            <Home className="h-16 w-16 text-muted-foreground/60" />
          </div>
        )}

        <div className="px-4 pb-6 pt-4 md:px-0 md:pt-0">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Left content */}
            <div className="flex-1">
              {/* Title / location */}
              <div className="mb-4">
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{listing.title}</h1>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                  {listing.address && ` — ${listing.address}`}
                </p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium text-foreground">
                    {reviewStats.average > 0 ? reviewStats.average.toFixed(1) : '—'}
                  </span>
                  <span className="text-muted-foreground">· {reviewStats.count} avis</span>
                  <span className="text-muted-foreground">· {typeLabels[listing.type] || listing.type}</span>
                </div>
              </div>

              {/* Desktop action buttons */}
              <div className="mb-6 hidden items-center gap-3 md:flex">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-lg border border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 rounded-lg border border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  <Heart className={cn('h-4 w-4', isFavorite ? 'fill-destructive text-destructive' : '')} />
                  Favoris
                </button>
              </div>

              {/* Key details */}
              <div className="mb-6 grid grid-cols-3 gap-3 border-y border py-5">
                <div className="text-center">
                  <BedDouble className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Pièces</p>
                  <p className="font-semibold text-foreground">{listing.rooms}</p>
                </div>
                <div className="text-center">
                  <Maximize className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Superficie</p>
                  <p className="font-semibold text-foreground">{listing.area ? `${listing.area} m²` : '-'}</p>
                </div>
                <div className="text-center">
                  <Home className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{typeLabels[listing.type] || listing.type}</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-display mb-2 text-lg font-bold text-foreground">Description</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-display mb-3 text-lg font-bold text-foreground">Équipements</h2>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full border border px-3 py-1.5 text-xs text-foreground"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {listing.rules && (
                <div className="mb-6">
                  <h2 className="font-display mb-2 text-lg font-bold text-foreground">Règles et conditions</h2>
                  <p className="whitespace-pre-line rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                    {listing.rules}
                  </p>
                </div>
              )}

              {/* Host */}
              {listing.landlord && (
              <div className="mb-6 border-y border py-5">
                <h2 className="font-display mb-3 text-lg font-bold text-foreground">Hôte</h2>
                <div className="flex items-center gap-3">
                  {listing.landlord.avatar ? (
                    <img
                      src={listing.landlord.avatar}
                      alt={listing.landlord.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <User className="h-7 w-7 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{listing.landlord.name}</p>
                    {listing.landlord.city && (
                      <p className="text-sm text-muted-foreground">{listing.landlord.city}</p>
                    )}
                    {listing.landlord.verified && (
                      <p className="text-xs text-primary">Identité vérifiée</p>
                    )}
                  </div>
                </div>
              </div>
              )}

              {/* Reviews */}
              <ReviewsSection listingId={listing.id} />

              {/* Map */}
              {listing.latitude && listing.longitude && (
                <div className="mb-6">
                  <h2 className="font-display mb-3 text-lg font-bold text-foreground">Localisation</h2>
                  <MapView
                    latitude={listing.latitude}
                    longitude={listing.longitude}
                    title={listing.title}
                    className="h-64 w-full rounded-2xl"
                    single
                  />
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop price card */}
            <div className="hidden w-full max-w-sm md:block md:sticky md:top-40">
              <div className="rounded-2xl border border p-5 shadow-sm">
                <div className="mb-4">
                  <span className="text-2xl font-bold text-foreground">{listing.price.toLocaleString()} FCFA</span>
                  <span className="text-muted-foreground"> / mois</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={handleBooking}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:bg-primary hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Réserver
                  </button>
                  <button
                    onClick={handleContact}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-900 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contacter
                  </button>
                </div>
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-muted-foreground">Prix mensuel hors charges éventuelles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card p-4 shadow-sm md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xl font-bold text-foreground">{listing.price.toLocaleString()} FCFA</p>
            <p className="text-xs text-muted-foreground">/ mois</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleContact}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Contacter
            </button>
            <button
              onClick={handleBooking}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
