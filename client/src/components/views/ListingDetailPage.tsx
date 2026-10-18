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
  ShieldCheck,
  Clock,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { ReviewsSection } from '@/components/shared/ReviewsSection';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { ReportButton } from '@/components/shared/ReportButton';
import { ListingStatusManager } from '@/components/shared/ListingStatusManager';
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
        <div className="space-y-4 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
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
    router.push(`/messages/${listing.landlord.id}?name=${encodeURIComponent(listing.landlord.name)}`);
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

  const daysSincePosted = listing.createdAt 
    ? Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="flex-1 bg-card pb-20 md:pb-0">
      {/* Mobile top bar */}
      <div className="sticky top-20 z-30 flex items-center justify-between border-b bg-card/95 backdrop-blur px-4 py-2 md:hidden">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-foreground">
          <ChevronLeft className="h-5 w-5" />
          Retour
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="rounded-full p-2 hover:bg-muted transition">
            <Share2 className="h-5 w-5 text-foreground" />
          </button>
          <button onClick={toggleFavorite} className="rounded-full p-2 hover:bg-muted transition">
            <Heart className={cn('h-5 w-5 transition-colors', isFavorite ? 'fill-destructive text-destructive' : 'text-foreground')} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-0 md:px-6 lg:px-8">
        {/* Mobile image carousel */}
        <div className="relative h-72 w-full overflow-hidden md:hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
          {images.length > 0 ? (
            <img
              src={images[currentImage]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Home className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur p-2 shadow-lg hover:bg-card transition">
                <ChevronLeft className="h-5 w-5 text-foreground" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur p-2 shadow-lg hover:bg-card transition">
                <ChevronRight className="h-5 w-5 text-foreground" />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentImage(i); }}
                    className={cn('h-2 w-2 rounded-full transition-all', i === currentImage ? 'bg-card w-4' : 'bg-card/60')}
                  />
                ))}
              </div>
            </>
          )}
          {listing.status === 'available' && (
            <div className="absolute top-3 left-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
              Disponible
            </div>
          )}
          {listing.status === 'viewing_in_progress' && (
            <div className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
              Visite en cours
            </div>
          )}
          {listing.status === 'reserved' && (
            <div className="absolute top-3 left-3 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
              Réservé
            </div>
          )}
          {listing.status === 'rented' && (
            <div className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
              Loué
            </div>
          )}
          {listing.verified && (
            <div className="absolute top-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-lg flex items-center gap-1">
              <BadgeCheck className="h-3 w-3" />
              Vérifié
            </div>
          )}
        </div>

        {/* Desktop image gallery */}
        {images.length > 0 ? (
          <div className="hidden h-[500px] w-full gap-2 py-6 md:grid md:grid-cols-2 md:grid-rows-2">
            <div className="relative col-span-1 row-span-2 overflow-hidden rounded-l-2xl bg-muted cursor-pointer group" onClick={() => setLightboxOpen(true)}>
              <img
                src={images[0]}
                alt={listing.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              {listing.status === 'available' && (
                <div className="absolute top-4 left-4 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Disponible
                </div>
              )}
              {listing.status === 'viewing_in_progress' && (
                <div className="absolute top-4 left-4 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Visite en cours
                </div>
              )}
              {listing.status === 'reserved' && (
                <div className="absolute top-4 left-4 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Réservé
                </div>
              )}
              {listing.status === 'rented' && (
                <div className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                  Loué
                </div>
              )}
              {listing.verified && (
                <div className="absolute top-4 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-lg flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" />
                  Vérifié
                </div>
              )}
            </div>
            {images[1] && (
              <div className="relative overflow-hidden bg-muted cursor-pointer group" onClick={() => { setCurrentImage(1); setLightboxOpen(true); }}>
                <img src={images[1]} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {images[2] && (
              <div className="relative overflow-hidden rounded-tr-2xl bg-muted cursor-pointer group" onClick={() => { setCurrentImage(2); setLightboxOpen(true); }}>
                <img src={images[2]} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {images.length > 3 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                +{images.length - 3} photos
              </div>
            )}
          </div>
        ) : (
          <div className="hidden h-[500px] w-full items-center justify-center rounded-2xl bg-muted md:flex">
            <Home className="h-16 w-16 text-muted-foreground/60" />
          </div>
        )}

        <div className="px-4 pb-6 pt-4 md:px-0 md:pt-0">
          <div className="flex flex-col gap-8 md:flex-row md:items-start">
            {/* Left content */}
            <div className="flex-1">
              {/* Title / location */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{listing.title}</h1>
                    <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                      {listing.address && ` — ${listing.address}`}
                    </p>
                  </div>
                  <ListingStatusManager
                    listingId={listing.id}
                    currentStatus={listing.status || 'available'}
                    isOwner={currentUser?.id === listing.landlordId}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium text-foreground">
                      {reviewStats.average > 0 ? reviewStats.average.toFixed(1) : '—'}
                    </span>
                    <span className="text-muted-foreground">({reviewStats.count} avis)</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                    <Home className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{typeLabels[listing.type] || listing.type}</span>
                  </div>
                  {daysSincePosted !== null && daysSincePosted < 7 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Clock className="h-3 w-3" />
                      Nouveau
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop action buttons */}
              <div className="mb-6 hidden items-center gap-3 md:flex">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted hover:shadow-md"
                >
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
                <button
                  onClick={toggleFavorite}
                  className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted hover:shadow-md"
                >
                  <Heart className={cn('h-4 w-4 transition-colors', isFavorite ? 'fill-destructive text-destructive' : '')} />
                  {isFavorite ? 'Sauvegardé' : 'Favoris'}
                </button>
                <ReportButton 
                  targetType="listing" 
                  targetId={listing.id} 
                  targetTitle={listing.title}
                />
              </div>

              {/* Key details */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 border border-muted/50">
                <h2 className="font-display mb-4 text-lg font-bold text-foreground">Caractéristiques</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-card p-4 text-center shadow-sm hover:shadow-md transition">
                    <BedDouble className="mx-auto mb-2 h-6 w-6 text-primary" />
                    <p className="text-xs text-muted-foreground">Pièces</p>
                    <p className="font-display font-semibold text-foreground">{listing.rooms ?? '-'}</p>
                  </div>
                  <div className="rounded-xl bg-card p-4 text-center shadow-sm hover:shadow-md transition">
                    <Maximize className="mx-auto mb-2 h-6 w-6 text-primary" />
                    <p className="text-xs text-muted-foreground">Superficie</p>
                    <p className="font-display font-semibold text-foreground">{listing.area ? `${listing.area} m²` : '-'}</p>
                  </div>
                  <div className="rounded-xl bg-card p-4 text-center shadow-sm hover:shadow-md transition">
                    <Home className="mx-auto mb-2 h-6 w-6 text-primary" />
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-display font-semibold text-foreground">{typeLabels[listing.type] || listing.type}</p>
                  </div>
                  <div className="rounded-xl bg-card p-4 text-center shadow-sm hover:shadow-md transition">
                    <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-green-600" />
                    <p className="text-xs text-muted-foreground">État</p>
                    <p className="font-display font-semibold text-foreground">{listing.available ? 'Disponible' : 'Occupé'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="font-display mb-3 text-lg font-bold text-foreground">À propos de ce logement</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-display mb-4 text-lg font-bold text-foreground">Ce que propose ce logement</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {listing.rules && (
                <div className="mb-6">
                  <h2 className="font-display mb-3 text-lg font-bold text-foreground">Règles et conditions</h2>
                  <div className="rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-5 border border-muted/50">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {listing.rules}
                    </p>
                  </div>
                </div>
              )}

              {/* Host */}
              {listing.landlord && (
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 border border-muted/50">
                <h2 className="font-display mb-4 text-lg font-bold text-foreground">Votre hôte</h2>
                <div className="flex items-center gap-4">
                  {listing.landlord.avatar ? (
                    <img
                      src={listing.landlord.avatar}
                      alt={listing.landlord.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10 shadow-lg"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card ring-4 ring-primary/10 shadow-lg">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="font-display text-lg font-semibold text-foreground">{listing.landlord.name}</p>
                    {listing.landlord.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {listing.landlord.city}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {listing.landlord.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                          <ShieldCheck className="h-3 w-3" />
                          Identité vérifiée
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                        <Star className="h-3 w-3 fill-current" />
                        Hôte réactif
                      </span>
                    </div>
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
                  <div className="rounded-2xl overflow-hidden border border-muted/50 shadow-sm">
                    <MapView
                      latitude={listing.latitude}
                      longitude={listing.longitude}
                      title={listing.title}
                      className="h-80 w-full"
                      single
                    />
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                    {listing.address && ` — ${listing.address}`}
                  </p>
                </div>
              )}
            </div>

            {/* Desktop price card */}
            <div className="hidden w-full max-w-sm md:block md:sticky md:top-40">
              <div className="rounded-2xl border border p-6 shadow-lg bg-card">
                <div className="mb-4">
                  <span className="text-3xl font-bold text-foreground">{listing.price.toLocaleString()} FCFA</span>
                  <span className="text-muted-foreground"> / mois</span>
                </div>
                {!listing.available && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    <Clock className="h-4 w-4" />
                    Ce logement est actuellement indisponible
                  </div>
                )}
                <div className="space-y-3">
                  <button
                    onClick={handleBooking}
                    disabled={!listing.available}
                    className={cn(
                      'flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
                      listing.available
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <CalendarDays className="h-4 w-4" />
                    {listing.available ? 'Réserver' : 'Indisponible'}
                  </button>
                  <button
                    onClick={handleContact}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-foreground py-3 text-sm font-medium text-foreground transition hover:bg-muted hover:shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contacter l'hôte
                  </button>
                </div>
                <div className="mt-4 space-y-2 border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Réponse en moins de 24h</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Paiement sécurisé</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Prix mensuel hors charges éventuelles.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile action bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur p-4 shadow-lg md:hidden">
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
              disabled={!listing.available}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95',
                listing.available
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {listing.available ? 'Réserver' : 'Indisponible'}
            </button>
          </div>
        </div>
      </div>

      <ImageLightbox
        images={images}
        current={currentImage}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onChange={setCurrentImage}
      />
    </div>
  );
}
