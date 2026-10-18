'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiGet, apiPost } from '@/lib/api';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Phone, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Booking, PaymentMethod } from '@/types';

const METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  { id: 'flooz', label: 'Moov Money (Flooz)', color: 'bg-blue-600' },
  { id: 'tmoney', label: 'T-Money', color: 'bg-yellow-500' },
  { id: 'wave', label: 'Wave', color: 'bg-sky-500' },
  { id: 'orange_money', label: 'Orange Money', color: 'bg-orange-500' },
];

type PaymentMode = 'demo' | 'kagopay' | 'unavailable';
type Step = 'form' | 'verify' | 'pending';

interface KagoPayLink {
  amount: number;
  currency: string;
  reference: string | null;
  status: string;
  expiresAt: string;
}

interface KagoPayStatus {
  status: 'pending' | 'success' | 'failed';
  reference: string;
  operator: 'yas' | 'moov';
  message?: string;
}

interface BookingWithListing extends Booking {
  listing: NonNullable<Booking['listing']>;
  payment: NonNullable<Booking['payment']> | null;
}

export function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingWithListing | null>(null);
  const [fetching, setFetching] = useState(true);
  const [method, setMethod] = useState<PaymentMethod>('flooz');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('unavailable');
  const [reference, setReference] = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<KagoPayStatus['status'] | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [{ bookingId }, modeData, bookings] = await Promise.all([
          params,
          apiGet<{ mode: PaymentMode }>('/api/payments'),
          apiGet<Booking[]>('/api/bookings?scope=tenant'),
        ]);
        if (!mounted) return;

        setPaymentMode(modeData.mode);
        const found = bookings.find((item) => item.id === bookingId) as BookingWithListing | undefined;
        if (!found?.listing) return;
        setBooking(found);

        if (modeData.mode === 'demo' && found.payment && found.payment.status === 'pending') {
          setPaymentId(found.payment.id);
          setPhone(found.payment.phone);
          setMethod(found.payment.method);
          setStep('verify');
        }

        if (modeData.mode === 'kagopay' && found.status === 'accepted' && found.paymentStatus !== 'paid') {
          const existing = await apiGet<{ paymentLink: KagoPayLink | null }>(
            `/api/payments/kagopay/initiate?bookingId=${encodeURIComponent(bookingId)}`
          );
          const link = existing.paymentLink;
          if (mounted && link?.reference && (link.status === 'pending' || link.status === 'paid')) {
            setReference(link.reference);
            setProviderStatus(link.status === 'paid' ? 'success' : 'pending');
            setStep('pending');
          }
        }
      } catch {
        if (mounted) setPaymentMode('unavailable');
      } finally {
        if (mounted) setFetching(false);
      }
    };

    void load();
    return () => { mounted = false; };
  }, [params]);

  const amount = useMemo(() => {
    if (!booking) return 0;
    const days = Math.ceil(
      (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const total = (booking.listing.price / 30) * (days > 0 ? days : 30);
    return Math.round(total);
  }, [booking]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !currentUser) return;

    setLoading(true);
    try {
      if (paymentMode === 'kagopay') {
        const result = await apiPost<{
          reference: string;
          status: KagoPayStatus['status'];
          message?: string;
        }>('/api/payments/kagopay/initiate', {
          bookingId: booking.id,
          phone,
        });
        setReference(result.reference);
        setProviderStatus(result.status);
        setStep('pending');
        toast.success(result.message || t('payment.initiated', lang));
        return;
      }

      if (paymentMode !== 'demo') {
        toast.error(t('payment.unavailable', lang));
        return;
      }

      const data = await api.payments.create({
        bookingId: booking.id,
        method,
        phone,
        amount,
      }) as { payment: { id: string }; message: string; isDemoMode?: boolean };
      toast.success(data.message || t('payment.initiated', lang));
      setPaymentId(data.payment.id);
      setIsDemoMode(data.isDemoMode || false);
      setStep('verify');
    } catch (error) {
      const msg = error instanceof Error ? error.message : t('common.error', lang);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckKagoPayStatus = async () => {
    if (!reference) return;

    setLoading(true);
    try {
      const status = await apiGet<KagoPayStatus>(
        `/api/payments/kagopay/status?reference=${encodeURIComponent(reference)}`
      );
      setProviderStatus(status.status);

      if (status.status === 'success') {
        const bookings = await apiGet<Booking[]>('/api/bookings?scope=tenant');
        const updated = bookings.find((item) => item.id === booking?.id);
        if (updated?.paymentStatus === 'paid') {
          setBooking(updated as BookingWithListing);
          toast.success(t('payment.confirmed', lang));
          router.push('/profile');
          return;
        }
        toast.success(t('payment.providerConfirmed', lang));
      } else if (status.status === 'failed') {
        toast.error(t('payment.providerFailed', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentId) return;

    setLoading(true);
    try {
      const data = await api.payments.verify({ paymentId, code }) as { message: string };
      toast.success(data.message || t('payment.confirmed', lang));
      router.push('/profile');
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

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">{t('payment.notFound', lang)}</p>
      </div>
    );
  }

  if (booking.paymentStatus === 'paid' || (booking.payment && booking.payment.status === 'paid')) {
    return (
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        <Card className="bg-primary/5 border-primary/20 text-center p-8">
          <h1 className="text-xl font-bold text-primary mb-2">{t('payment.paid', lang)}</h1>
          <p className="text-sm text-primary">{t('payment.paidMessage', lang)}</p>
          <Button className="mt-6" onClick={() => router.push('/profile')}>
            {t('common.back', lang)}
          </Button>
        </Card>
      </div>
    );
  }

  if (booking.status !== 'accepted') {
    return (
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {booking.status === 'pending' ? t('payment.awaitingApproval', lang) : t('payment.notAccepted', lang)}
          </p>
          <Button className="mt-6" onClick={() => router.push('/profile')}>
            {t('common.back', lang)}
          </Button>
        </Card>
      </div>
    );
  }

  if (paymentMode === 'unavailable') {
    return (
      <div className="flex-1 container mx-auto px-4 py-6 max-w-lg">
        <Card className="p-6 text-center">
          <p className="text-sm text-muted-foreground">{t('payment.unavailable', lang)}</p>
          <Button className="mt-6" onClick={() => router.push('/profile')}>
            {t('common.back', lang)}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-lg">
      <h1 className="font-display text-xl md:text-2xl font-bold mb-6">{t('payment.title', lang)}</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">{booking.listing.title}</h3>
              <p className="text-xs text-muted-foreground">
                {booking.listing.quartier ? `${booking.listing.quartier}, ` : ''}
                {booking.listing.city}
              </p>
            </div>
          </div>
          <div className="flex justify-between text-sm pt-3 border-t">
            <span className="text-muted-foreground">{t('payment.amount', lang)}</span>
            <span className="font-bold text-primary text-lg">{amount.toLocaleString()} {t('common.fcfa', lang)}</span>
          </div>
        </CardContent>
      </Card>

      {step === 'pending' ? (
        <div className="space-y-4">
          <Card className={cn(
            'border',
            providerStatus === 'failed' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'
          )}>
            <CardContent className="p-4 text-sm">
              <p className="font-medium">
                {providerStatus === 'failed'
                  ? t('payment.providerFailed', lang)
                  : providerStatus === 'success'
                    ? t('payment.providerConfirmed', lang)
                    : t('payment.providerPending', lang)}
              </p>
              {reference && <p className="mt-2 text-xs text-muted-foreground">{t('payment.reference', lang)}: {reference}</p>}
            </CardContent>
          </Card>
          {providerStatus === 'failed' ? (
            <Button className="w-full" onClick={() => { setProviderStatus(null); setReference(null); setStep('form'); }}>
              {t('payment.retry', lang)}
            </Button>
          ) : (
            <Button className="w-full" onClick={handleCheckKagoPayStatus} disabled={loading}>
              {loading ? t('common.loading', lang) : t('payment.checkStatus', lang)}
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={() => router.push('/profile')}>
            {t('common.back', lang)}
          </Button>
        </div>
      ) : step === 'form' ? (
        <form onSubmit={handleInitiate} className="space-y-5">
          {paymentMode === 'demo' ? (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('payment.method', lang)}</label>
              <div className="grid grid-cols-2 gap-3">
                {METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition',
                      method === m.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-muted'
                    )}
                  >
                    <Wallet className={cn('h-4 w-4', method === m.id ? 'text-primary' : 'text-muted-foreground')} />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-sm text-primary">
                {t('payment.mobileRequest', lang)}
              </CardContent>
            </Card>
          )}

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              <Phone className="h-4 w-4 inline mr-1" />
              {t('payment.phone', lang)}
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="228 90 00 00 00"
              required
              minLength={8}
            />
            {paymentMode === 'demo' && (
              <p className="text-xs text-muted-foreground mt-1.5">{t('payment.simulation', lang)}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading', lang) : t('payment.initiate', lang)}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          {isDemoMode && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4 text-sm text-amber-900">
                <p className="font-medium">Mode démo activé</p>
                <p className="mt-1 text-xs">Entrez n'importe quel code à 4-6 chiffres pour simuler le paiement.</p>
              </CardContent>
            </Card>
          )}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-sm text-primary">
              <p>{t('payment.codeSent', lang)} {phone}.</p>
            </CardContent>
          </Card>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{t('payment.code', lang)}</label>
            <Input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="1234"
              required
              minLength={4}
              maxLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading', lang) : t('payment.verify', lang)}
          </Button>
        </form>
      )}
    </div>
  );
}
