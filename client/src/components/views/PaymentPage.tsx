'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t } from '@/lib/translations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { MapPin, Phone, Wallet } from 'lucide-react';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: string;
  listing: {
    id: string;
    title: string;
    price: number;
    city: string;
    quartier?: string | null;
    images: string[];
  };
  payment?: {
    id: string;
    amount: number;
    method: string;
    phone: string;
    status: string;
    transactionRef: string;
  } | null;
}

const METHODS = [
  { id: 'flooz', label: 'Moov Money (Flooz)', color: 'bg-blue-600' },
  { id: 'tmoney', label: 'T-Money', color: 'bg-yellow-500' },
  { id: 'wave', label: 'Wave', color: 'bg-sky-500' },
  { id: 'orange_money', label: 'Orange Money', color: 'bg-orange-500' },
];

export function PaymentPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [fetching, setFetching] = useState(true);
  const [method, setMethod] = useState('flooz');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    params.then(({ bookingId }) => {
      apiFetch(`/api/bookings?scope=tenant`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: Booking[]) => {
          const found = data?.find((b) => b.id === bookingId);
          if (found) {
            setBooking(found);
            const days = Math.ceil(
              (new Date(found.endDate).getTime() - new Date(found.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const total = (found.listing.price / 30) * (days > 0 ? days : 30);
            setAmount(Math.round(total));
            if (found.payment && found.payment.status === 'pending') {
              setPaymentId(found.payment.id);
              setPhone(found.payment.phone);
              setMethod(found.payment.method);
              setStep('verify');
            }
          }
        })
        .finally(() => setFetching(false));
    });
  }, [params]);

  const handleInitiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !currentUser) return;

    setLoading(true);
    try {
      const res = await apiFetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          method,
          phone,
          amount,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Payment initiated');
        setPaymentId(data.payment.id);
        setStep('verify');
      } else {
        toast.error(data.error || t('common.error', lang));
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
      const res = await apiFetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, code }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Payment confirmed');
        router.push('/profile');
      } else {
        toast.error(data.error || t('common.error', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
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
        <Card className="bg-emerald-50 border-emerald-200 text-center p-8">
          <h1 className="text-xl font-bold text-emerald-800 mb-2">{t('payment.paid', lang)}</h1>
          <p className="text-sm text-emerald-700">
            {t('payment.paidMessage', lang)}
          </p>
          <Button className="mt-6" onClick={() => router.push('/profile')}>
            {t('common.back', lang)}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-lg">
      <h1 className="text-xl md:text-2xl font-bold mb-6">{t('payment.title', lang)}</h1>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-6 w-6 text-emerald-700" />
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
            <span className="font-bold text-emerald-700 text-lg">{amount.toLocaleString()} FCFA</span>
          </div>
        </CardContent>
      </Card>

      {step === 'form' ? (
        <form onSubmit={handleInitiate} className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('payment.method', lang)}</label>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left text-sm transition ${
                    method === m.id
                      ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
                      : 'border-border bg-white hover:bg-muted'
                  }`}
                >
                  <Wallet className={`h-4 w-4 ${method === m.id ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

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
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('payment.simulation', lang)}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading', lang) : t('payment.initiate', lang)}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-5">
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 text-sm text-emerald-800">
              <p>{t('payment.codeSent', lang)} {phone}.</p>
              <p className="mt-1 text-xs text-emerald-600">
                {t('payment.demoCode', lang)}
              </p>
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
