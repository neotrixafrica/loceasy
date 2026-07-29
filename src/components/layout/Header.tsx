'use client';

import { useAppStore, type View } from '@/lib/store';
import { t } from '@/lib/translations';
import { Home, Search, MessageCircle, Heart, User, LayoutDashboard, PlusCircle, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function Header() {
  const { lang, setLang, currentUser, navigate, currentView } = useAppStore();

  const navItems: { view: View; label: string; icon?: typeof Home }[] = [];

  if (currentUser?.role === 'landlord') {
    navItems.push({ view: 'landlord-dashboard', label: t('nav.dashboard', lang) });
    navItems.push({ view: 'add-listing', label: t('nav.addListing', lang), icon: PlusCircle });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-6">
        {/* Back button for detail views */}
        {(currentView === 'listing-detail' || currentView === 'booking-form' || currentView === 'conversation' || currentView === 'add-listing') && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => useAppStore.getState().goBack()}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
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
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition-colors',
                lang === 'fr'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              onClick={() => setLang('fr')}
            >
              FR
            </button>
            <button
              className={cn(
                'px-2.5 py-1 text-xs font-medium transition-colors',
                lang === 'en'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
              onClick={() => setLang('en')}
            >
              EN
            </button>
          </div>

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
  const { lang, currentView, navigate, currentUser } = useAppStore();

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
              <tab.icon className={cn('h-5 w-5', isActive && 'font-bold')} />
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
