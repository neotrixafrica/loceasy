'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiGet } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/shared/ListingCard';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { t } from '@/lib/translations';
import { Search, BedDouble, Building, Building2, Home, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Listing } from '@/types';

const CATEGORIES = [
  { key: 'chambre', label: 'Chambres', icon: BedDouble },
  { key: 'studio', label: 'Studios', icon: Building },
  { key: 'appartement', label: 'Appartements', icon: Building2 },
  { key: 'maison', label: 'Maisons', icon: Home },
  { key: 'bureau', label: 'Bureaux', icon: Briefcase },
];

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80';

export function HomePage() {
  const { lang, currentUser, setFilters } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet<Listing[]>('/api/listings?city=')
      .then((data) => mounted && setListings(data.slice(0, 8)))
      .catch(() => mounted && setListings([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleSearch = () => {
    setFilters({ search });
    router.push('/search');
  };

  const handleCategory = (key: string) => {
    setActiveCategory(key);
    setFilters({ type: key });
    router.push('/search');
  };

  return (
    <div className="flex-1 bg-background">
      {/* Hero */}
      <section className="relative h-[460px] w-full overflow-hidden md:h-[580px]">
        <img
          src={HERO_IMAGE}
          alt="Intérieur chaleureux"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/30 to-foreground/70" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="font-display max-w-2xl text-4xl font-extrabold text-white md:text-6xl leading-tight">
            {t('hero.title', lang)}
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/90 md:text-lg font-medium">
            {t('hero.subtitle', lang)}
          </p>

          {/* Floating search */}
          <div className="mt-8 w-full max-w-2xl rounded-full bg-white/95 p-1.5 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 pr-2">
              <div className="flex flex-1 items-center gap-2 pl-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={t('hero.search.placeholder', lang)}
                  className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
              >
                {t('hero.search.button', lang)}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-card py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 md:justify-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategory(cat.key)}
                  className={cn(
                    'group flex shrink-0 flex-col items-center gap-2 border-b-2 border-transparent pb-2 pt-1 text-xs font-medium transition duration-200',
                    activeCategory === cat.key ? 'text-primary border-primary' : 'text-muted-foreground hover:text-foreground hover:border-primary/40'
                  )}
                >
                  <Icon className="h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-110" />
                  <span className="transition-transform duration-200 group-hover:-translate-y-0.5">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular listings */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <h2 className="font-display mb-6 text-2xl font-bold text-foreground md:text-3xl">
          {t('home.popular', lang)}
        </h2>

        {loading ? (
          <ListingGridSkeleton />
        ) : listings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('home.empty', lang)}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing, i) => (
              <ScrollReveal key={listing.id} delay={i * 75}>
                <ListingCard listing={listing} />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* CTA landlord */}
      {(!currentUser || currentUser.role === 'landlord') && (
        <section className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              {t('home.cta.title', lang)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
              {t('home.cta.desc', lang)}
            </p>
            <button
              onClick={() => {
                if (currentUser?.role === 'landlord') router.push('/add-listing');
                else router.push('/register');
              }}
              className="mt-6 rounded-full bg-accent px-8 py-3 text-sm font-bold text-accent-foreground shadow-lg transition-all duration-200 hover:bg-accent/90 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              {currentUser?.role === 'landlord' ? t('home.cta.add', lang) : t('home.cta.signup', lang)}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function ListingGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="aspect-[20/19] animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
