'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiGet, apiPost } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, CalendarDays, LogOut, Building2, MessageCircle, Heart, ShieldCheck, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ReputationBadge } from '@/components/shared/ReputationBadge';
import type { Booking, User, Lang } from '@/types';

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-900',
  accepted: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

export function ProfilePage() {
  const { lang, currentUser, login, logout } = useAppStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    let mounted = true;
    apiGet<Booking[]>('/api/bookings')
      .then((data) => mounted && setBookings(data))
      .catch(() => mounted && setBookings([]));
    return () => { mounted = false; };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    }
  }, [currentUser, router]);

  const handleVerify = async () => {
    router.push('/verification');
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/');
    toast.success(t('profile.logout.success', lang));
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-3xl">
      <ProfileHeader user={currentUser} lang={lang} />

      {!currentUser.verified && (
        <div className="mb-6 p-4 border border rounded-xl bg-muted">
          <p className="text-sm text-muted-foreground mb-3">{t('profile.verify.desc', lang)}</p>
          <Button onClick={handleVerify} className="w-full">
            {t('profile.verify.action', lang)}
          </Button>
        </div>
      )}

      <QuickActions user={currentUser} lang={lang} router={router} />

      {currentUser.role === 'landlord' && (
        <ReputationBadge
          trustScore={currentUser.trustScore || 0}
          badge={currentUser.badge || 'Débutant'}
          totalListings={currentUser.totalListings || 0}
          totalBookings={currentUser.totalBookings || 0}
          completedBookings={currentUser.completedBookings || 0}
          totalReviews={currentUser.totalReviews || 0}
          averageRating={currentUser.averageRating || 0}
          responseRate={currentUser.responseRate || 0}
          responseTime={currentUser.responseTime || 0}
        />
      )}

      {currentUser.role === 'tenant' && bookings.length > 0 && (
        <BookingList bookings={bookings} lang={lang} router={router} />
      )}

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

function ProfileHeader({ user, lang }: { user: any; lang: Lang }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-display text-lg font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant="secondary">
                {t(`profile.role.${user.role}`, lang)}
              </Badge>
              {user.badge && (
                <Badge className="bg-primary/10 text-primary">
                  {user.badge === 'trusted_host' && 'Hôte de confiance'}
                  {user.badge === 'super_host' && 'Super hôte'}
                  {user.badge === 'agency_verified' && 'Agence vérifiée'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
              {user.phoneVerified && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
            </div>
          )}
          {user.city && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user.city}</span>
            </div>
          )}
          {user.verificationStatus && (
            <div className="flex items-center gap-2 text-sm">
              {user.verificationStatus === 'verified' && (
                <>
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Identité vérifiée</span>
                </>
              )}
              {user.verificationStatus === 'pending' && (
                <>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">En cours</span>
                </>
              )}
              {user.verificationStatus === 'rejected' && (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Rejeté</span>
                </>
              )}
            </div>
          )}
        </div>

        {user.trustScore !== undefined && user.trustScore > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score de confiance</span>
              <span className="font-bold text-primary">{user.trustScore}/100</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActions({
  user,
  lang,
  router,
}: {
  user: any;
  lang: Lang;
  router: ReturnType<typeof useRouter>;
}) {
  return (
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
      <Button
        variant="outline"
        className="h-auto py-4 flex-col gap-2"
        onClick={() => router.push('/verification')}
      >
        <ShieldCheck className="h-5 w-5" />
        <span className="text-sm">Vérification</span>
      </Button>
      {user.role === 'landlord' && (
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
  );
}

function BookingList({
  bookings,
  lang,
  router,
}: {
  bookings: Booking[];
  lang: Lang;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-lg font-semibold mb-3">{t('booking.myBookings', lang)}</h2>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={statusClass[booking.status] || statusClass.cancelled}>
                      {t(`status.${booking.status}`, lang)}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-foreground">{booking.listing?.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {booking.listing?.city}{booking.listing?.quartier ? `, ${booking.listing.quartier}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <CalendarDays className="h-3 w-3 inline mr-1" />
                    {booking.startDate} → {booking.endDate}
                  </p>
                  {booking.status === 'accepted' && booking.paymentStatus !== 'paid' && (
                    <Button
                      size="sm"
                      className="mt-3"
                      onClick={() => router.push(`/payment/${booking.id}`)}
                    >
                      {t('booking.payNow', lang)}
                    </Button>
                  )}
                </div>
                <span className="font-semibold text-sm text-primary">
                  {booking.listing?.price?.toLocaleString()} {t('common.fcfa', lang)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
