import { Header, BottomNav } from '@/components/layout/Header';
import { SearchPage } from '@/components/views/SearchPage';

export default function Search() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <SearchPage />
      </main>
      <BottomNav />
    </div>
  );
}
