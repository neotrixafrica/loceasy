'use client';

import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { t } from '@/lib/translations';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Globe, User, Bell, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/Logo';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import type { Lang } from '@/types';

const LANGS: Record<Lang, string> = { fr: 'Français', en: 'English', ee: 'Ewe', kab: 'Kabiyé' };

export function Header() {
  const { lang, setLang, currentUser, notifications, logout } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [showLangs, setShowLangs] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangs(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    setShowMenu(false);
    try {
      await api.auth.logout();
    } catch {
      // ignore
    }
    logout();
    router.push('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled || pathname !== '/' ? 'bg-background/95 backdrop-blur-sm border-b shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Logo />

        <button
          onClick={() => router.push('/search')}
          className="hidden sm:flex items-center gap-3 bg-white border border-border rounded-full shadow-sm hover:shadow-md transition-shadow py-2.5 pl-6 pr-2 text-sm"
        >
          <span className="font-medium text-foreground">{t('search.title', lang)}</span>
          <span className="w-px h-5 bg-border" />
          <span className="text-muted-foreground">{t('header.searchHint', lang)}</span>
          <span className="w-px h-5 bg-border" />
          <div className="bg-primary text-primary-foreground rounded-full p-1.5">
            <Search className="w-3.5 h-3.5" />
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => currentUser ? router.push('/add-listing') : router.push('/login')}
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2.5 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('header.listYourHome', lang)}
          </button>

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="p-2.5 hover:bg-muted rounded-full transition-colors"
            >
              <Globe className="w-4 h-4" />
            </button>
            {showLangs && (
              <div className="absolute right-0 top-full mt-2 bg-popover border rounded-xl shadow-xl py-2 min-w-[160px]">
                {(Object.keys(LANGS) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l as Lang); setShowLangs(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors',
                      lang === l ? 'font-semibold text-primary' : 'text-foreground'
                    )}
                  >
                    {LANGS[l as Lang]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ThemeToggle />

          {currentUser && (
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 hover:bg-muted rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 border border-border rounded-full p-1.5 pl-3 hover:shadow-md transition-shadow"
          >
            <Menu className="w-4 h-4" />
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-4 top-16 bg-popover border rounded-xl shadow-xl py-2 min-w-[220px]">
              {currentUser ? (
                <>
                  <MenuItem onClick={() => { setShowMenu(false); router.push('/profile'); }}>{t('nav.profile', lang)}</MenuItem>
                  <MenuItem onClick={() => { setShowMenu(false); router.push('/messages'); }}>{t('nav.messages', lang)}</MenuItem>
                  <MenuItem onClick={() => { setShowMenu(false); router.push('/favorites'); }}>{t('nav.favorites', lang)}</MenuItem>
                  {currentUser.role === 'landlord' && (
                    <MenuItem onClick={() => { setShowMenu(false); router.push('/landlord-dashboard'); }}>{t('nav.dashboard', lang)}</MenuItem>
                  )}
                  <hr className="my-1" />
                  <MenuItem onClick={handleLogout}>{t('profile.logout', lang)}</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={() => { setShowMenu(false); router.push('/login'); }} className="font-medium">{t('nav.login', lang)}</MenuItem>
                  <MenuItem onClick={() => { setShowMenu(false); router.push('/register'); }}>{t('nav.register', lang)}</MenuItem>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ onClick, children, className }: { onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn('w-full text-left px-4 py-3 text-sm hover:bg-accent transition-colors', className)}
    >
      {children}
    </button>
  );
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang, currentUser, notifications } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  const tabs = [
    { href: '/', icon: '●', label: t('nav.home', lang) },
    { href: '/favorites', icon: '♥', label: t('nav.favorites', lang) },
    { href: '/messages', icon: '✉', label: t('nav.messages', lang) },
    { href: '/profile', icon: '☺', label: t('nav.profile', lang) },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.href}
            onClick={() => router.push(currentUser || tab.href === '/' ? tab.href : '/login')}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px]',
              pathname === tab.href ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.href === '/messages' && unread > 0 && (
              <span className="absolute top-2 right-[25%] w-2 h-2 bg-destructive rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
