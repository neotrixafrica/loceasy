'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Header, BottomNav } from '@/components/layout/Header';
import { ListingDetailPage } from '@/components/views/ListingDetailPage';
import { apiGet } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import type { Listing } from '@/types';

export default function ListingDetail() {
  const params = useParams() as { id: string };
  const { id } = params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    apiGet<Listing>(`/api/listings/${id}`)
      .then((data) => mounted && setListing(data))
      .catch(() => mounted && setListing(null))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
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
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <ListingDetailPage listing={listing ?? undefined} />
      </main>
      <BottomNav />
    </div>
  );
}
