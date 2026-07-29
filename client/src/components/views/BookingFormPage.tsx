'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { CalendarDays, MapPin, User } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  landlord: { id: string; name: string };
}

export function BookingFormPage() {
  const { lang, navigate, navigationData, currentUser } = useAppStore();
  const listing = navigationData.listing as Listing | undefined;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !listing) return;

    setLoading(true);
    try {
      const res = await apiFetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          message,
          tenantId: currentUser.id,
          listingId: listing.id,
        }),
      });
      if (res.ok) {
        toast.success(t('booking.success', lang));
        navigate('listing-detail', { listing });
      } else {
        toast.error(t('common.error', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  };

  if (!listing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No listing selected</p>
      </div>
    );
  }

  // Calculate total
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = startDate && endDate && end > start
    ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const total = days > 0 ? (listing.price / 30 * days) : 0;

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-lg">
      <h1 className="text-xl md:text-2xl font-bold mb-6">{t('booking.title', lang)}</h1>

      {/* Listing summary */}
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
              {listing.price.toLocaleString()} FCFA/{lang === 'fr' ? 'mois' : 'month'}
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

        {/* Cost summary */}
        {days > 0 && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {lang === 'fr' ? `${days} nuits` : `${days} nights`}
                </span>
                <span>{total.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-emerald-200">
                <span>{lang === 'fr' ? 'Total estimé' : 'Estimated total'}</span>
                <span className="text-emerald-700">{total.toLocaleString()} FCFA</span>
              </div>
              <p className="text-[10px] text-emerald-600 mt-2">
                {lang === 'fr'
                  ? 'Paiement par Mobile Money (Moov Money, T-Money)'
                  : 'Payment via Mobile Money (Moov Money, T-Money)'}
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('listing-detail', { listing })}>
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
