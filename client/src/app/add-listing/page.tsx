import { Header, BottomNav } from '@/components/layout/Header';
import { AddListingPage } from '@/components/views/AddListingPage';

export default function AddListing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <AddListingPage />
      </main>
      <BottomNav />
    </div>
  );
}
