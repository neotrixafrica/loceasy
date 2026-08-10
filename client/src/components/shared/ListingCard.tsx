'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Heart, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Landlord {
  id: string;
  name: string;
  verified?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  images: string[];
  averageRating?: number;
  landlord?: Landlord;
}

const typeLabels: Record<string, string> = {
  chambre: 'Chambre',
  studio: 'Studio',
  appartement: 'Appartement',
  maison: 'Maison',
  bureau: 'Bureau',
};

export function ListingCard({ listing }: { listing: Listing }) {
  const { currentUser } = useAppStore();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const image = listing.images?.[0];
  const label = typeLabels[listing.type] || listing.type;

  useEffect(() => {
    if (currentUser) {
      apiFetch(`/api/favorites?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((favs: Listing[]) => setIsFavorite(favs.some((f) => f.id === listing.id)))
        .catch(() => {});
    }
  }, [currentUser, listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push('/login');
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
          body: JSON.stringify({ listingId: listing.id }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleClick = () => {
    router.push(`/listing/${listing.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[20/19] w-full overflow-hidden rounded-xl bg-slate-100">
        {image && !imageError ? (
          <img
            src={image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200">
            <svg
              className="h-10 w-10 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {listing.landlord?.verified && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-900 shadow-sm">
            Vérifié
          </span>
        )}

        <button
          onClick={toggleFavorite}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
          aria-label="Favori"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-700'
            )}
          />
        </button>

        {!!listing.averageRating && listing.averageRating > 0 && (
          <div className="absolute right-3 top-12 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 shadow-sm">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-semibold text-slate-900">{listing.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900">
            {listing.title}
          </h3>
          {listing.averageRating && listing.averageRating > 0 && (
            <div className="flex shrink-0 items-center gap-1 text-xs text-slate-900">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{listing.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="flex items-center gap-1 text-sm text-slate-500 line-clamp-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span>
            {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
          </span>
        </p>

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="text-sm font-medium text-slate-900">
          {listing.price.toLocaleString()} FCFA
          <span className="font-normal text-slate-500"> / mois</span>
        </p>
      </div>
    </div>
  );
}
