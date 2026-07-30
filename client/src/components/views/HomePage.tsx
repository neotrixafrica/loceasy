'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ListingCard } from '@/components/shared/ListingCard';
import { Search, BedDouble, Building, Building2, Home, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  city: string;
  quartier: string | null;
  images: string[];
  landlord?: { id: string; name: string; verified?: boolean };
}

const categories = [
  { key: 'chambre', label: 'Chambres', icon: BedDouble },
  { key: 'studio', label: 'Studios', icon: Building },
  { key: 'appartement', label: 'Appartements', icon: Building2 },
  { key: 'maison', label: 'Maisons', icon: Home },
  { key: 'bureau', label: 'Bureaux', icon: Briefcase },
];

const heroImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=80';

export function HomePage() {
  const { currentUser, setFilters } = useAppStore();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/listings?city=')
      .then((res) => res.json())
      .then((data: Listing[]) => setListings(data.slice(0, 8)))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    setFilters({ search });
    router.push('/search');
  };

  const handleCategory = (key: string) => {
    setFilters({ type: key });
    router.push('/search');
  };

  return (
    <div className="flex-1 bg-white">
      {/* Hero */}
      <section className="relative h-[420px] w-full overflow-hidden md:h-[520px]">
        <img
          src={heroImage}
          alt="Intérieur"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/30 to-slate-900/50" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="max-w-2xl text-3xl font-semibold text-white md:text-5xl">
            Trouvez votre prochain logement
          </h1>
          <p className="mt-3 max-w-lg text-base text-white/90 md:text-lg">
            Chambres, studios et appartements partout au Togo.
          </p>

          {/* Floating search */}
          <div className="mt-8 w-full max-w-2xl rounded-full bg-white p-1.5 shadow-xl">
            <div className="flex items-center gap-2 pr-2">
              <div className="flex flex-1 items-center gap-2 pl-4">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ville, quartier..."
                  className="h-11 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={handleSearch}
                className="flex h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b border-slate-100 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => handleCategory(cat.key)}
                  className={cn(
                    'flex shrink-0 flex-col items-center gap-2 border-b-2 border-transparent pb-2 pt-1 text-xs font-medium text-slate-500 transition hover:text-slate-900',
                    'hover:border-slate-900'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular listings */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:py-14">
        <h2 className="mb-6 text-xl font-semibold text-slate-900 md:text-2xl">
          Logements populaires
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[20/19] animate-pulse rounded-xl bg-slate-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <p className="text-sm text-slate-500">Aucun logement disponible.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* CTA landlord */}
      {(!currentUser || currentUser.role === 'landlord') && (
        <section className="bg-slate-50 py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h2 className="text-xl font-semibold text-slate-900 md:text-2xl">
              Propriétaire ?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Publiez gratuitement vos annonces et trouvez rapidement des locataires.
            </p>
            <button
              onClick={() => {
                if (currentUser?.role === 'landlord') router.push('/add-listing');
                else router.push('/register');
              }}
              className="mt-5 rounded-lg border border-slate-900 bg-white px-6 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              {currentUser?.role === 'landlord' ? 'Ajouter une annonce' : 'Créer un compte'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
