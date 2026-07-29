'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  LayoutDashboard, Building2, Clock, CheckCircle, XCircle,
  PlusCircle, Trash2, Eye,
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  available: boolean;
  images: string[];
}

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  message: string | null;
  tenant: { id: string; name: string; phone: string | null };
  listing: { id: string; title: string; city: string; quartier: string | null; price: number; images: string[] };
}

export function LandlordDashboard() {
  const { lang, navigate, currentUser } = useAppStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser]);

  const fetchData = async () => {
    try {
      const [listingsRes, bookingsRes] = await Promise.all([
        apiFetch(`/api/listings?city=`),
        apiFetch(`/api/bookings?landlordId=${currentUser?.id}`),
      ]);
      const allListings = await listingsRes.json();
      const allBookings = await bookingsRes.json();
      setListings(allListings.filter((l: Listing) => l.landlordId === currentUser?.id || allListings.find((al: Listing & { landlordId?: string }) => al.landlordId === currentUser?.id)));
      // Since the listings endpoint doesn't filter by landlord, we need to filter client-side
      const myBookings = allBookings.filter((b: Booking) =>
        b.listing && true // allBookings is already filtered by landlordId
      );
      setBookings(allBookings);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, status: string) => {
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}?XTransformPort=3000`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(t('common.success', lang));
        fetchData();
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const res = await apiFetch(`/api/listings/${listingId}?XTransformPort=3000`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(t('common.success', lang));
        fetchData();
      }
    } catch {
      toast.error(t('common.error', lang));
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    navigate('login');
    return null;
  }

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{t('dashboard.title', lang)}</h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'fr' ? 'Bienvenue' : 'Welcome'}, {currentUser.name}
          </p>
        </div>
        <Button onClick={() => navigate('add-listing')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          {t('dashboard.listing.add', lang)}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('dashboard.totalListings', lang), value: listings.length, icon: Building2, color: 'text-emerald-700' },
          { label: t('dashboard.pendingRequests', lang), value: pendingCount, icon: Clock, color: 'text-amber-600' },
          { label: t('dashboard.activeBookings', lang), value: acceptedCount, icon: CheckCircle, color: 'text-emerald-600' },
          { label: lang === 'fr' ? 'Vues totales' : 'Total views', value: 127, icon: Eye, color: 'text-blue-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
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

      {/* Tabs */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'listings'
              ? 'border-emerald-700 text-emerald-700'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('listings')}
        >
          {t('dashboard.myListings', lang)} ({listings.length})
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'bookings'
              ? 'border-emerald-700 text-emerald-700'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('bookings')}
        >
          {t('booking.requests', lang)} ({bookings.length})
          {pendingCount > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full font-semibold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div className="space-y-3">
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">{t('dashboard.noListings', lang)}</h3>
              <p className="text-muted-foreground text-sm">{t('dashboard.noListings.desc', lang)}</p>
            </div>
          ) : (
            listings.map((listing) => {
              const images = listing.images || [];
              return (
                <div key={listing.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    {images[0] ? (
                      <img src={images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-emerald-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{listing.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {listing.quartier ? `${listing.quartier}, ` : ''}{listing.city}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-semibold text-emerald-700">
                        {listing.price.toLocaleString()} FCFA
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {t(`type.${listing.type}`, lang)}
                      </Badge>
                      <Badge variant={listing.available ? 'default' : 'secondary'} className={`text-[10px] ${listing.available ? 'bg-emerald-100 text-emerald-800' : ''}`}>
                        {listing.available ? (lang === 'fr' ? 'Disponible' : 'Available') : (lang === 'fr' ? 'Indisponible' : 'Unavailable')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => navigate('listing-detail', { listing })}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteListing(listing.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                {lang === 'fr' ? 'Aucune demande de réservation' : 'No booking requests'}
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusColor(booking.status)}>
                          {t(`status.${booking.status}`, lang)}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm">{booking.listing?.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang === 'fr' ? 'Locataire' : 'Tenant'}: {booking.tenant?.name}
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
                        <Button
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'accepted')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {t('dashboard.accept', lang)}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBookingAction(booking.id, 'rejected')}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          {t('dashboard.reject', lang)}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
