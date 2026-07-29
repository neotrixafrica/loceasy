'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Heart, MapPin, BedDouble, Maximize } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  images: string;
  area: number | null;
  rooms: number;
  amenities: string;
  landlord: { id: string; name: string };
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { lang, navigate, currentUser } = useAppStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const images: string[] = listing.images ? JSON.parse(listing.images) : [];

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/favorites?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((favs) => setIsFavorite(favs.some((f: { id: string }) => f.id === listing.id)))
        .catch(() => {});
    }
  }, [currentUser, listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('login');
      return;
    }
    try {
      if (isFavorite) {
        await fetch(`/api/favorites?userId=${currentUser.id}&listingId=${listing.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await fetch('/api/favorites', {
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

  const handleClick = async () => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`);
      if (res.ok) {
        const data = await res.json();
        navigate('listing-detail', { listing: data });
      }
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    }
  };

  const typeColor = listing.type === 'chambre' ? 'bg-emerald-100 text-emerald-800' :
    listing.type === 'studio' ? 'bg-amber-100 text-amber-800' :
    'bg-blue-100 text-blue-800';

  return (
    <div
      className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[16/11] bg-muted overflow-hidden">
        {images[0] && !imageError ? (
          <img
            src={images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-emerald-300 flex items-center justify-center">
            <svg className="h-10 w-10 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-emerald-700 text-white text-xs font-semibold px-2 py-0.5 shadow-sm">
            {listing.price.toLocaleString()} FCFA
          </Badge>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge className={cn('text-[10px] px-1.5 py-0 shadow-sm', typeColor)}>
            {t(`type.${listing.type}`, lang)}
          </Badge>
        </div>

        {/* Favorite button */}
        <button
          className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          onClick={toggleFavorite}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {listing.title}
        </h3>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">
            {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
          </span>
        </p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <BedDouble className="h-3 w-3" />
            {listing.rooms}
          </span>
          {listing.area && (
            <span className="flex items-center gap-0.5">
              <Maximize className="h-3 w-3" />
              {listing.area} m²
            </span>
          )}
          {listing.landlord && (
            <span className="text-[11px] text-muted-foreground">
              {lang === 'fr' ? 'par' : 'by'} {listing.landlord.name.split(' ')[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
