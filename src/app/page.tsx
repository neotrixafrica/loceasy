'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Header, BottomNav } from '@/components/layout/Header';
import { HomePage } from '@/components/views/HomePage';
import { SearchPage } from '@/components/views/SearchPage';
import { ListingDetailPage } from '@/components/views/ListingDetailPage';
import { LoginPage } from '@/components/views/LoginPage';
import { RegisterPage } from '@/components/views/RegisterPage';
import { LandlordDashboard } from '@/components/views/LandlordDashboard';
import { AddListingPage } from '@/components/views/AddListingPage';
import { MessagesPage } from '@/components/views/MessagesPage';
import { FavoritesPage } from '@/components/views/FavoritesPage';
import { ProfilePage } from '@/components/views/ProfilePage';
import { BookingFormPage } from '@/components/views/BookingFormPage';
import { AnimatePresence, motion } from 'framer-motion';

function Footer() {
  const { lang } = useAppStore();
  return (
    <footer className="border-t bg-card py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center">
                <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="font-bold">
                <span className="text-emerald-800">LocEasy</span>{' '}
                <span className="text-amber-600">Togo</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer.description', lang)}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{lang === 'fr' ? 'Liens utiles' : 'Useful links'}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><button className="hover:text-emerald-700 transition-colors">{t('footer.about', lang)}</button></li>
              <li><button className="hover:text-emerald-700 transition-colors">{t('footer.contact', lang)}</button></li>
              <li><button className="hover:text-emerald-700 transition-colors">{t('footer.terms', lang)}</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.contact', lang)}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>📍 Lomé, Togo</li>
              <li>📧 contact@loceasy.tg</li>
              <li>📞 +228 90 00 00 00</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-6 pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LocEasy Togo. {t('footer.rights', lang)}.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomePage />;
      case 'search': return <SearchPage />;
      case 'listing-detail': return <ListingDetailPage />;
      case 'login': return <LoginPage />;
      case 'register': return <RegisterPage />;
      case 'landlord-dashboard': return <LandlordDashboard />;
      case 'add-listing': return <AddListingPage />;
      case 'messages':
      case 'conversation': return <MessagesPage />;
      case 'favorites': return <FavoritesPage />;
      case 'profile': return <ProfilePage />;
      case 'booking-form': return <BookingFormPage />;
      default: return <HomePage />;
    }
  };

  const hideFooter = ['listing-detail', 'messages', 'conversation', 'login', 'register'].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <AnimatePresence mode="wait">
        <motion.main
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-1 flex flex-col"
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>

      {!hideFooter && <Footer />}

      <BottomNav />
    </div>
  );
}
