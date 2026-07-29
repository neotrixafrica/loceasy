import { Header, BottomNav } from '@/components/layout/Header';
import { FavoritesPage } from '@/components/views/FavoritesPage';

export default function Favorites() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <FavoritesPage />
      </main>
      <BottomNav />
    </div>
  );
}
