'use client';

import { useAppStore, type View } from '@/lib/store';
import { t, LANG_LABELS } from '@/lib/translations';
import { Home, Search, MessageCircle, Heart, User, LayoutDashboard, PlusCircle, ChevronLeft, Bell, WifiOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export function Header() {
  const { lang, setLang, currentUser, navigate, currentView, notifications } = useAppStore();
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

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const navItems: { view: View; label: string; icon?: typeof Home }[] = [];

  if (currentUser?.role === 'landlord') {
    navItems.push({ view: 'landlord-dashboard', label: t('nav.dashboard', lang) });
    navItems.push({ view: 'add-listing', label: t('nav.addListing', lang), icon: PlusCircle });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        {/* Back button for detail views */}
        {(currentView === 'listing-detail' || currentView === 'booking-form' || currentView === 'conversation' || currentView === 'add-listing' || currentView === 'notifications') && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => useAppStore.getState().goBack()}
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
          onClick={() => navigate('home')}
        >
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="hidden sm:inline text-emerald-800">LocEasy</span>
          <span className="hidden sm:inline text-amber-600">Togo</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Button variant="ghost" size="sm" onClick={() => navigate('home')}>
            {t('nav.home', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('search')}>
            {t('nav.search', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => currentUser ? navigate('messages') : navigate('login')}>
            {t('nav.messages', lang)}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => currentUser ? navigate('favorites') : navigate('login')}>
            {t('nav.favorites', lang)}
          </Button>
          {navItems.map((item) => (
            <Button key={item.view} variant="ghost" size="sm" onClick={() => navigate(item.view)}>
              {item.label}
            </Button>
          ))}
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
              onClick={() => navigate('notifications')}
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
              onClick={() => navigate('profile')}
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
              <Button variant="ghost" size="sm" onClick={() => navigate('login')}>
                {t('nav.login', lang)}
              </Button>
              <Button size="sm" onClick={() => navigate('register')}>
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
  const { lang, currentView, navigate, currentUser, notifications } = useAppStore();

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const tabs = [
    { view: 'home' as View, label: t('nav.home', lang), icon: Home },
    { view: 'search' as View, label: t('nav.search', lang), icon: Search },
    { view: 'messages' as View, label: t('nav.messages', lang), icon: MessageCircle },
    { view: 'favorites' as View, label: t('nav.favorites', lang), icon: Heart },
    { view: 'profile' as View, label: t('nav.profile', lang), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = currentView === tab.view || 
            (tab.view === 'profile' && !currentUser && currentView === 'login') ||
            (tab.view === 'profile' && !currentUser && currentView === 'register');
          
          return (
            <button
              key={tab.view}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative',
                isActive
                  ? 'text-emerald-700'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => navigate(tab.view)}
            >
              <div className="relative">
                <tab.icon className={cn('h-5 w-5', isActive && 'font-bold')} />
                {tab.view === 'profile' && currentUser && unreadNotifications > 0 && (
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
