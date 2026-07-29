import { Header, BottomNav } from '@/components/layout/Header';
import { HomePage } from '@/components/views/HomePage';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <HomePage />
      </main>
      <BottomNav />
    </div>
  );
}
