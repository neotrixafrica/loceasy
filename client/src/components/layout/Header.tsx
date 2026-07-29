'use client';

import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t, LANG_LABELS } from '@/lib/translations';
import { Home, Search, MessageCircle, Heart, User, PlusCircle, ChevronLeft, Bell, WifiOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function Header() {
  const { lang, setLang, currentUser, notifications } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user) useAppStore.getState().login(user);
        else useAppStore.getState().logout();
      })
      .catch(() => useAppStore.getState().logout());
  }, []);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const showBack =
    !!pathname && (
      pathname.startsWith('/listing') ||
      pathname === '/booking-form' ||
      pathname.startsWith('/messages/') ||
      pathname === '/add-listing' ||
      pathname === '/notifications'
    );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        {/* Back button for detail views */}
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Offline indicator */}
        {!isOnline && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-0.5 text-[10px] font-medium flex items-center justify-center gap-1 z-50">
            <WifiOff className="h-3 w-3" />
            {t('offline.title', lang)}
          </div>
        )}

        {/* Logo */}
        <button
          className="flex items-center gap-2 font-bold text-lg mr-4 hover:opacity-80 transition-opacity"
          onClick={() => router.push('/')}
        >
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline text-emerald-800">LocEasy</span>
          <span className="hidden sm:inline text-amber-600">Togo</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            {t('nav.home', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push('/search')}>
            {t('nav.search', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => currentUser ? router.push('/messages') : router.push('/login')}>
            {t('nav.messages', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => currentUser ? router.push('/favorites') : router.push('/login')}>
            {t('nav.favorites', lang)}
          </Button>
          {currentUser?.role === 'landlord' && (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/landlord-dashboard')}>
                {t('nav.dashboard', lang)}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/add-listing')}>
                <PlusCircle className="h-4 w-4 mr-1" />
                {t('nav.addListing', lang)}
              </Button>
            </>
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Language switcher */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs px-2"
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="uppercase font-semibold">{lang}</span>
            </Button>
            {showLangMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-card border rounded-lg shadow-lg z-50 py-1 min-w-[120px] animate-in slide-in-from-top-2 duration-150">
                  {(['fr', 'en', 'ee', 'kab'] as const).map((l) => (
                    <button
                      key={l}
                      className={cn(
                        'w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between',
                        lang === l
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'hover:bg-muted text-foreground'
                      )}
                      onClick={() => {
                        setLang(l);
                        setShowLangMenu(false);
                      }}
                    >
                      <span>{LANG_LABELS[l]}</span>
                      <span className="uppercase text-[10px] opacity-60">{l}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Notifications bell */}
          {currentUser && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => router.push('/notifications')}
            >
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold animate-bounce">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </Button>
          )}

          {/* Auth */}
          {currentUser ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => router.push('/profile')}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="text-xs font-medium text-emerald-700">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:inline text-sm">{currentUser.name.split(' ')[0]}</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                {t('nav.login', lang)}
              </Button>
              <Button size="sm" onClick={() => router.push('/register')}>
                {t('nav.register', lang)}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { lang, currentUser, notifications } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const tabs = [
    { href: '/', label: t('nav.home', lang), icon: Home },
    { href: '/search', label: t('nav.search', lang), icon: Search },
    { href: '/messages', label: t('nav.messages', lang), icon: MessageCircle },
    { href: '/favorites', label: t('nav.favorites', lang), icon: Heart },
    { href: '/profile', label: t('nav.profile', lang), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (tab.href === '/profile' && !currentUser && (pathname === '/login' || pathname === '/register'));

          return (
            <button
              key={tab.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative',
                isActive
                  ? 'text-emerald-700'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => router.push(tab.href)}
            >
              <div className="relative">
                <tab.icon className={cn('h-5 w-5', isActive && 'font-bold')} />
                {tab.href === '/profile' && currentUser && unreadNotifications > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                    {unreadNotifications > 9 ? '9' : unreadNotifications}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-700 rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
