'use client';

import { t } from '@/lib/translations';
import { useAppStore } from '@/lib/store';
import { Home, MapPin, Building2, GraduationCap, Briefcase, Search as SearchIcon } from 'lucide-react';

export function HomePage() {
  const { lang, navigate, setFilters, currentUser } = useAppStore();

  const cities = [
    { name: 'Lomé', key: 'lome', listings: 6 },
    { name: 'Sokodé', key: 'sokode', listings: 1 },
    { name: 'Kara', key: 'kara', listings: 2 },
    { name: 'Atakpamé', key: 'atakpame', listings: 1 },
    { name: 'Kpalimé', key: 'kpalime', listings: 1 },
    { name: 'Tsévié', key: 'tsevie', listings: 1 },
    { name: 'Aného', key: 'aneho', listings: 1 },
    { name: 'Dapaong', key: 'dapaong', listings: 1 },
  ];

  const handleSearch = (searchTerm: string) => {
    setFilters({ search: searchTerm });
    navigate('search');
  };

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {t('hero.title', lang)}
            </h1>
            <p className="text-emerald-100 text-base md:text-lg mb-8 max-w-2xl mx-auto">
              {t('hero.subtitle', lang)}
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-2 max-w-xl mx-auto flex items-center gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('hero.search.placeholder', lang)}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <button
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input) handleSearch(input.value);
                }}
              >
                {t('hero.search.button', lang)}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mt-8">
              {[
                { value: '14', label: t('hero.stats.listings', lang) },
                { value: '10', label: t('hero.stats.cities', lang) },
                { value: '4', label: t('hero.stats.users', lang) },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-emerald-200 text-xs md:text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
            {t('cities.title', lang)}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {t('cities.subtitle', lang)}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {cities.map((city) => (
            <button
              key={city.key}
              onClick={() => {
                setFilters({ city: city.name });
                navigate('search');
              }}
              className="group bg-card border rounded-xl p-4 md:p-5 hover:border-emerald-300 hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
                <Building2 className="h-5 w-5 text-emerald-700" />
              </div>
              <h3 className="font-semibold text-sm md:text-base text-foreground">
                {city.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {city.listings} {t('cities.listings', lang)}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-muted/50 py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
              {t('how.title', lang)}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('how.subtitle', lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                icon: SearchIcon,
                title: t('how.step1.title', lang),
                desc: t('how.step1.desc', lang),
              },
              {
                step: '2',
                icon: Building2,
                title: t('how.step2.title', lang),
                desc: t('how.step2.desc', lang),
              },
              {
                step: '3',
                icon: Home,
                title: t('how.step3.title', lang),
                desc: t('how.step3.desc', lang),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-card rounded-xl p-6 border text-center hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-emerald-700" />
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-base mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="container mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-card border rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                {lang === 'fr' ? 'Étudiants' : 'Students'}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {lang === 'fr'
                  ? 'Des chambres abordables près des universités et écoles. Meublées, avec internet et toutes les commodités pour réussir vos études.'
                  : 'Affordable rooms near universities and schools. Furnished, with internet and all amenities to succeed in your studies.'}
              </p>
            </div>
          </div>
          <div className="bg-card border rounded-xl p-6 flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                {lang === 'fr' ? 'Fonctionnaires' : 'Civil Servants'}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {lang === 'fr'
                  ? 'Des studios et appartements confortables pour les fonctionnaires affectés. Proche des administrations et services publics.'
                  : 'Comfortable studios and apartments for civil servants on assignment. Close to administrations and public services.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for landlords */}
      {(!currentUser || currentUser.role === 'landlord') && (
        <section className="bg-emerald-700 text-white py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-3">
              {lang === 'fr' ? 'Propriétaire ?' : 'Landlord?'}
            </h2>
            <p className="text-emerald-100 text-sm md:text-base mb-6 max-w-xl mx-auto">
              {lang === 'fr'
                ? 'Publiez vos annonces gratuitement et trouvez rapidement des locataires vérifiés parmi les étudiants et fonctionnaires.'
                : 'Post your listings for free and quickly find verified tenants among students and civil servants.'}
            </p>
            <button
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={() => {
                if (currentUser?.role === 'landlord') {
                  navigate('add-listing');
                } else {
                  navigate('register');
                }
              }}
            >
              {currentUser?.role === 'landlord'
                ? t('dashboard.listing.add', lang)
                : t('nav.register', lang)}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
