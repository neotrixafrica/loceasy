'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header, BottomNav } from '@/components/layout/Header';
import { ListingDetailPage } from '@/components/views/ListingDetailPage';
import { apiFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';

type Listing = {
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
};

export default function ListingDetail() {
  const { id } = useParams() as { id: string };
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    apiFetch(`/api/listings/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setListing(data as Listing | null))
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-700 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <ListingDetailPage listing={listing ?? undefined} />
      </main>
      <BottomNav />
    </div>
  );
}
