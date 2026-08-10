'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiGet } from '@/lib/api';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/types';

export function BookingFormPage({ listingId }: { listingId?: string }) {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!listingId);

  useEffect(() => {
    if (!listingId) {
      setFetching(false);
      return;
    }
    let mounted = true;
    setFetching(true);
    apiGet<Listing>(`/api/listings/${listingId}`)
      .then((data) => mounted && setListing(data))
      .catch(() => mounted && setListing(null))
      .finally(() => mounted && setFetching(false));
    return () => { mounted = false; };
  }, [listingId]);

  const days = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end > start
      ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
  }, [startDate, endDate]);

  const total = useMemo(() => {
    if (!listing || days <= 0) return 0;
    return Math.round((listing.price / 30) * days);
  }, [listing, days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !listing) return;

    setLoading(true);
    try {
      await api.bookings.create({
        listingId: listing.id,
        startDate,
        endDate,
        message,
      });
      toast.success(t('booking.success', lang));
      router.push(`/listing/${listing.id}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('common.error', lang);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.loading', lang)}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">{t('booking.noListing', lang)}</p>
      </div>
    );
  }

  const priceLabel = t('common.perMonth', lang);

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-lg">
      <h1 className="text-xl md:text-2xl font-bold mb-6">{t('booking.title', lang)}</h1>

      <Card className="mb-6">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <MapPin className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">
              {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
            </p>
            <p className="text-sm font-semibold text-emerald-700 mt-0.5">
              {listing.price.toLocaleString()} {t('common.fcfa', lang)}{priceLabel}
            </p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('booking.start', lang)}</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('booking.end', lang)}</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">{t('booking.message', lang)}</label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('booking.message.placeholder', lang)}
            rows={4}
          />
        </div>

        {days > 0 && (
          <CostSummary days={days} total={total} lang={lang} />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.push(`/listing/${listing.id}`)}>
            {t('common.cancel', lang)}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t('common.loading', lang) : t('booking.submit', lang)}
          </Button>
        </div>
      </form>
    </div>
  );
}

function CostSummary({ days, total, lang }: { days: number; total: number; lang: string }) {
  return (
    <Card className="bg-emerald-50 border-emerald-200">
      <CardContent className="p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {days} {t('common.nights', lang)}
          </span>
          <span>{total.toLocaleString()} {t('common.fcfa', lang)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-emerald-200">
          <span>{t('booking.total', lang)}</span>
          <span className="text-emerald-700">{total.toLocaleString()} {t('common.fcfa', lang)}</span>
        </div>
        <p className="text-[10px] text-emerald-600 mt-2">
          {t('booking.paymentNote', lang)}
        </p>
      </CardContent>
    </Card>
  );
}
