import { Header, BottomNav } from '@/components/layout/Header';
import { SearchPage } from '@/components/views/SearchPage';

export default function Search() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <SearchPage />
      </main>
      <BottomNav />
    </div>
  );
}
