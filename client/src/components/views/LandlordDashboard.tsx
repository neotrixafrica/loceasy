'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiGet, apiPatch, apiDelete } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Clock, CheckCircle, XCircle, PlusCircle, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Listing, Booking } from '@/types';

type Tab = 'listings' | 'bookings';

export function LandlordDashboard() {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    const load = async () => {
      try {
        const [allListings, allBookings] = await Promise.all([
          apiGet<Listing[]>('/api/listings?city='),
          apiGet<Booking[]>('/api/bookings'),
        ]);
        if (!mounted) return;
        setListings(allListings.filter((l) => l.landlordId === currentUser.id));
        setBookings(allBookings);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [allListings, allBookings] = await Promise.all([
        apiGet<Listing[]>('/api/listings?city='),
        apiGet<Booking[]>('/api/bookings'),
      ]);
      setListings(allListings.filter((l) => l.landlordId === currentUser?.id));
      setBookings(allBookings);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleBookingAction = async (bookingId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiPatch(`/api/bookings/${bookingId}`, { status });
      toast.success(t('common.success', lang));
      fetchData();
    } catch {
      toast.error(t('common.error', lang));
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      await apiDelete(`/api/listings/${listingId}`);
      toast.success(t('common.success', lang));
      fetchData();
    } catch {
      toast.error(t('common.error', lang));
    }
  };

  if (!currentUser) {
    router.push('/login');
    return null;
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;

  const stats = [
    { label: t('dashboard.totalListings', lang), value: listings.length, icon: Building2, color: 'text-emerald-700' },
    { label: t('dashboard.pendingRequests', lang), value: pendingCount, icon: Clock, color: 'text-amber-600' },
    { label: t('dashboard.activeBookings', lang), value: acceptedCount, icon: CheckCircle, color: 'text-emerald-600' },
    { label: t('dashboard.totalViews', lang), value: 127, icon: Eye, color: 'text-blue-600' },
  ];

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('dashboard.title', lang)}</h1>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.welcome', lang)}, {currentUser.name}
          </p>
        </div>
        <Button onClick={() => router.push('/add-listing')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('dashboard.listing.add', lang)}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-lg bg-muted flex items-center justify-center', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs activeTab={activeTab} onChange={setActiveTab} listingsCount={listings.length} bookingsCount={bookings.length} pendingCount={pendingCount} lang={lang} />

      {activeTab === 'listings' ? (
        <ListingsTab listings={listings} lang={lang} onDelete={handleDeleteListing} onView={(id) => router.push(`/listing/${id}`)} loading={loading} />
      ) : (
        <BookingsTab bookings={bookings} lang={lang} onAction={handleBookingAction} loading={loading} />
      )}
    </div>
  );
}

function Tabs({ activeTab, onChange, listingsCount, bookingsCount, pendingCount, lang }: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  listingsCount: number;
  bookingsCount: number;
  pendingCount: number;
  lang: string;
}) {
  return (
    <div className="flex border-b mb-4">
      {[
        { key: 'listings' as Tab, label: t('dashboard.myListings', lang), count: listingsCount },
        { key: 'bookings' as Tab, label: t('booking.requests', lang), count: bookingsCount, badge: pendingCount },
      ].map((tab) => (
        <button
          key={tab.key}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
            activeTab === tab.key
              ? 'border-emerald-700 text-emerald-700'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.label} ({tab.count})
          {tab.badge ? (
            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-semibold">
              {tab.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

function ListingsTab({ listings, lang, onDelete, onView, loading }: {
  listings: Listing[];
  lang: string;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  loading: boolean;
}) {
  if (loading) return <DashboardSkeleton />;
  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-1">{t('dashboard.noListings', lang)}</h3>
        <p className="text-muted-foreground text-sm">{t('dashboard.noListings.desc', lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {listings.map((listing) => (
        <div key={listing.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
          <ListingImage images={listing.images} />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{listing.title}</h3>
            <p className="text-xs text-muted-foreground">
              {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-emerald-700">
                {listing.price.toLocaleString()} {t('common.fcfa', lang)}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {t(`type.${listing.type}`, lang)}
              </Badge>
              <Badge
                variant={listing.available ? 'default' : 'secondary'}
                className={cn('text-[10px]', listing.available ? 'bg-emerald-100 text-emerald-800' : '')}
              >
                {listing.available ? t('common.available', lang) : t('common.unavailable', lang)}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onView(listing.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(listing.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ListingImage({ images }: { images: string[] }) {
  return (
    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
      {images[0] ? (
        <img src={images[0]} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
          <Building2 className="h-6 w-6 text-emerald-600" />
        </div>
      )}
    </div>
  );
}

function BookingsTab({ bookings, lang, onAction, loading }: {
  bookings: Booking[];
  lang: string;
  onAction: (id: string, status: 'accepted' | 'rejected') => void;
  loading: boolean;
}) {
  if (loading) return <DashboardSkeleton />;
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">{t('dashboard.noBookings', lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} lang={lang} onAction={onAction} />
      ))}
    </div>
  );
}

function BookingCard({ booking, lang, onAction }: { booking: Booking; lang: string; onAction: (id: string, status: 'accepted' | 'rejected') => void }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={booking.status} lang={lang} />
            </div>
            <h3 className="font-medium text-sm">{booking.listing?.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {t('common.tenant', lang)}: {booking.tenant?.name}
              {booking.tenant?.phone && ` — ${booking.tenant.phone}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {booking.startDate} → {booking.endDate}
            </p>
            {booking.message && (
              <p className="text-xs text-foreground/70 mt-2 bg-muted/50 rounded p-2">
                {booking.message}
              </p>
            )}
          </div>
          {booking.status === 'pending' && (
            <div className="flex flex-col gap-1">
              <Button size="sm" onClick={() => onAction(booking.id, 'accepted')}>
                <CheckCircle className="h-3 w-3 mr-1" />
                {t('dashboard.accept', lang)}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onAction(booking.id, 'rejected')}>
                <XCircle className="h-3 w-3 mr-1" />
                {t('dashboard.reject', lang)}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, lang }: { status: string; lang: string }) {
  const className = {
    pending: 'bg-amber-100 text-amber-800',
    accepted: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }[status] || 'bg-gray-100 text-gray-800';

  return (
    <Badge className={className}>
      {t(`status.${status}`, lang)}
    </Badge>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card border rounded-xl p-4 flex items-center gap-4 animate-pulse">
          <div className="w-20 h-20 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-3 w-1/3 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
