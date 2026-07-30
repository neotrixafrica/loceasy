'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail, Phone, MapPin, CalendarDays,
  LogOut, Building2, MessageCircle, Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  listing: {
    title: string;
    city: string;
    quartier: string | null;
    price: number;
  } | null;
}

export function ProfilePage() {
  const { lang, currentUser, logout } = useAppStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (currentUser) {
      const load = async () => {
        try {
          const res = await apiFetch(`/api/bookings?tenantId=${currentUser.id}`);
          if (res.ok) {
            setBookings(await res.json());
          }
        } catch (error) {
          console.error('Failed to fetch bookings:', error);
        }
      };
      load();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors
    }
    logout();
    router.push('/');
    toast.success(lang === 'fr' ? 'Déconnecté avec succès' : 'Logged out successfully');
  };

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'accepted': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-3xl">
      {/* Profile header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-xl font-bold text-emerald-700">
                {currentUser.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">{currentUser.name}</h1>
              <Badge variant="secondary" className="mt-1">
                {t(`profile.role.${currentUser.role}`, lang)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{currentUser.email}</span>
            </div>
            {currentUser.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{currentUser.phone}</span>
              </div>
            )}
            {currentUser.city && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{currentUser.city}</span>
              </div>
            )}
            {currentUser.verified && (
              <Badge className="bg-emerald-100 text-emerald-800 w-fit">
                {lang === 'fr' ? 'Vérifié' : 'Verified'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => router.push('/messages')}
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">{t('nav.messages', lang)}</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex-col gap-2"
          onClick={() => router.push('/favorites')}
        >
          <Heart className="h-5 w-5" />
          <span className="text-sm">{t('nav.favorites', lang)}</span>
        </Button>
        {currentUser.role === 'landlord' && (
          <>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => router.push('/landlord-dashboard')}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-sm">{t('nav.dashboard', lang)}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => router.push('/add-listing')}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-sm">{t('nav.addListing', lang)}</span>
            </Button>
          </>
        )}
      </div>

      {/* My Bookings (for tenants) */}
      {currentUser.role === 'tenant' && bookings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('booking.myBookings', lang)}</h2>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={statusColor(booking.status)}>
                          {t(`status.${booking.status}`, lang)}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-sm">{booking.listing?.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {booking.listing?.city}{booking.listing?.quartier ? `, ${booking.listing.quartier}` : ''}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <CalendarDays className="h-3 w-3 inline mr-1" />
                        {booking.startDate} → {booking.endDate}
                      </p>
                    </div>
                    <span className="font-semibold text-sm text-emerald-700">
                      {booking.listing?.price?.toLocaleString()} FCFA
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:text-destructive"
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('profile.logout', lang)}
      </Button>
    </div>
  );
}
