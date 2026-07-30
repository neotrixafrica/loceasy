'use client';

import { useAppStore } from '@/lib/store';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Globe, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const LANGS = { fr: 'Français', en: 'English', ee: 'Ewe', kab: 'Kabiyé' } as const;

type Lang = keyof typeof LANGS;

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/search', label: 'Explorer' },
];

export function Header() {
  const { lang, setLang, currentUser, notifications } = useAppStore();
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

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled || pathname !== '/' ? 'bg-white border-b shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-emerald-700 font-bold text-2xl tracking-tight shrink-0"
        >
          <span>LocEasy</span>
          <span className="hidden sm:inline text-xs font-normal text-slate-500 border border-slate-200 rounded px-1.5 py-0.5">
            Togo
          </span>
        </button>

        {/* Search bar */}
        <button
          onClick={() => router.push('/search')}
          className="hidden sm:flex items-center gap-3 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-shadow py-2.5 pl-6 pr-2 text-sm"
        >
          <span className="font-medium text-slate-700">Partout</span>
          <span className="w-px h-5 bg-slate-200" />
          <span className="text-slate-500">Chambre, studio, appart</span>
          <span className="w-px h-5 bg-slate-200" />
          <div className="bg-emerald-600 text-white rounded-full p-1.5">
            <Search className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => currentUser ? router.push('/add-listing') : router.push('/login')}
            className="hidden md:block text-sm font-medium hover:bg-slate-50 px-4 py-2.5 rounded-full transition-colors"
          >
            Mettre mon logement
          </button>

          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="p-2.5 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Globe className="w-4 h-4" />
            </button>
            {showLangs && (
              <div className="absolute right-0 top-full mt-2 bg-white border rounded-xl shadow-xl py-2 min-w-[160px]">
                {(Object.keys(LANGS) as Lang[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setShowLangs(false); }}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors',
                      lang === l ? 'font-semibold text-emerald-700' : 'text-slate-700'
                    )}
                  >
                    {LANGS[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentUser && (
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2.5 hover:bg-slate-50 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          )}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 border border-slate-200 rounded-full p-1.5 pl-3 hover:shadow-md transition-shadow"
          >
            <Menu className="w-4 h-4" />
            <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
          </button>

          {showMenu && (
            <div className="absolute right-4 top-16 bg-white border rounded-xl shadow-xl py-2 min-w-[220px]">
              {currentUser ? (
                <>
                  <button onClick={() => { setShowMenu(false); router.push('/profile'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Profil</button>
                  <button onClick={() => { setShowMenu(false); router.push('/messages'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Messages</button>
                  <button onClick={() => { setShowMenu(false); router.push('/favorites'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Favoris</button>
                  {currentUser.role === 'landlord' && (
                    <button onClick={() => { setShowMenu(false); router.push('/landlord-dashboard'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Tableau de bord</button>
                  )}
                  <hr className="my-1" />
                  <button onClick={() => { setShowMenu(false); router.push('/logout'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Déconnexion</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowMenu(false); router.push('/login'); }} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50">Connexion</button>
                  <button onClick={() => { setShowMenu(false); router.push('/register'); }} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">Inscription</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, notifications } = useAppStore();
  const unread = notifications.filter((n) => !n.read).length;

  const tabs = [
    { href: '/', icon: '●', label: 'Explorer' },
    { href: '/favorites', icon: '♥', label: 'Favoris' },
    { href: '/messages', icon: '✉', label: 'Messages' },
    { href: '/profile', icon: '☺', label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.href}
            onClick={() => router.push(currentUser || tab.href === '/' ? tab.href : '/login')}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px]',
              pathname === tab.href ? 'text-emerald-700' : 'text-slate-500'
            )}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.href === '/messages' && unread > 0 && (
              <span className="absolute top-2 right-[25%] w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
