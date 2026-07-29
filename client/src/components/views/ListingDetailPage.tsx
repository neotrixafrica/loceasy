'use client';

import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t } from '@/lib/translations';
import { Heart, MapPin, BedDouble, Maximize, ChevronLeft, ChevronRight, X, MessageCircle, CalendarDays, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/shared/MapView'), {
  ssr: false,
  loading: () => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl h-48 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-2 animate-pulse" />
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
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rooms: number;
  area: number | null;
  amenities: string[];
  images: string[];
  rules: string | null;
  landlord: {
    id: string;
    name: string;
    avatar: string | null;
    phone: string | null;
    city: string | null;
    email: string;
  };
}

export function ListingDetailPage() {
  const { lang, navigate, navigationData, currentUser } = useAppStore();
  const listing = navigationData.listing as Listing | undefined;
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  const images = listing ? listing.images : [];
  const amenities = listing ? listing.amenities : [];

  useEffect(() => {
    if (currentUser && listing) {
      apiFetch(`/api/favorites?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((favs) => setIsFavorite(favs.some((f: { id: string }) => f.id === listing.id)))
        .catch(() => {});
    }
  }, [currentUser, listing]);

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Listing not found</p>
      </div>
    );
  }

  const toggleFavorite = async () => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    try {
      if (isFavorite) {
        await apiFetch(`/api/favorites?userId=${currentUser.id}&listingId=${listing.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await apiFetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, listingId: listing.id }),
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleContact = () => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    navigate('conversation', { partnerId: listing.landlord.id, partnerName: listing.landlord.name, listingId: listing.id });
  };

  const handleBooking = () => {
    if (!currentUser) {
      navigate('login');
      return;
    }
    navigate('booking-form', { listing });
  };

  const typeLabel = t(`type.${listing.type}`, lang);
  const typeColor = listing.type === 'chambre' ? 'bg-emerald-100 text-emerald-800' :
    listing.type === 'studio' ? 'bg-amber-100 text-amber-800' :
    'bg-blue-100 text-blue-800';

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full">
      {/* Back button */}
      <div className="sticky top-14 z-40 bg-background/95 backdrop-blur border-b px-4 md:px-6 py-2 flex items-center gap-2 md:hidden">
        <Button variant="ghost" size="sm" onClick={() => useAppStore.getState().goBack()}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('detail.back', lang)}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" onClick={toggleFavorite}>
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-[16/10] bg-muted overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[currentImage]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
            <HomeIcon className="h-16 w-16 text-emerald-600" />
          </div>
        )}

        {/* Image navigation */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-colors"
              onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentImage ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentImage(i)}
                />
              ))}
            </div>
          </>
        )}

        {/* Price badge */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-emerald-700 text-white px-3 py-1 text-sm font-semibold">
            {listing.price.toLocaleString()} {t('detail.price', lang)}
          </Badge>
        </div>

        {/* Favorite (desktop) */}
        <button
          className="absolute top-3 left-3 hidden md:flex w-9 h-9 bg-white/90 hover:bg-white rounded-full items-center justify-center transition-colors shadow-sm"
          onClick={toggleFavorite}
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === currentImage ? 'border-emerald-600' : 'border-transparent'
              }`}
              onClick={() => setCurrentImage(i)}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 md:px-6 pb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left column */}
          <div className="flex-1">
            {/* Title & type */}
            <div className="mb-4 pt-2">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={typeColor}>{typeLabel}</Badge>
                <span className="text-xs text-muted-foreground">{listing.rooms} {t('detail.rooms', lang)}</span>
                {listing.area && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Maximize className="h-3 w-3" /> {listing.area} {t('detail.area', lang)}
                  </span>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold">{listing.title}</h1>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                {listing.address && ` - ${listing.address}`}
              </p>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-card border rounded-lg p-3 text-center">
                <BedDouble className="h-5 w-5 text-emerald-700 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{t('type.chambre', lang)}(s)</p>
                <p className="font-semibold text-sm">{listing.rooms}</p>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center">
                <Maximize className="h-5 w-5 text-emerald-700 mx-auto mb-1" />
                <p className="text-xs text-muted-foreground">{lang === 'fr' ? 'Superficie' : 'Area'}</p>
                <p className="font-semibold text-sm">{listing.area ? `${listing.area} m²` : '-'}</p>
              </div>
              <div className="bg-card border rounded-lg p-3 text-center">
                <Badge className="bg-emerald-50 text-emerald-800 border-0 px-2 py-0.5">
                  {typeLabel}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">{t('detail.description', lang)}</h2>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">{t('detail.amenities', lang)}</h2>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="text-xs px-3 py-1">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rules */}
            {listing.rules && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">{t('detail.rules', lang)}</h2>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {listing.rules}
                  </p>
                </div>
              </div>
            )}

            {/* Map */}
            {(listing.latitude && listing.longitude) && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">{t('detail.location', lang)}</h2>
                <MapView
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  title={listing.title}
                  className="h-64 rounded-xl overflow-hidden border"
                  single
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                  {listing.address && ` - ${listing.address}`}
                </p>
              </div>
            )}
          </div>

          {/* Right column - Booking card */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="sticky top-20 bg-card border rounded-xl p-5">
              <div className="mb-4">
                <span className="text-2xl font-bold text-emerald-700">
                  {listing.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground"> {t('detail.price', lang)}</span>
              </div>

              <div className="space-y-2 mb-4">
                <Button className="w-full" size="lg" onClick={handleBooking}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  {t('detail.book', lang)}
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('detail.contact', lang)}
                </Button>
              </div>

              {/* Landlord info */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">{t('detail.landlord', lang)}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{listing.landlord.name}</p>
                    {listing.landlord.city && (
                      <p className="text-xs text-muted-foreground">{listing.landlord.city}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
