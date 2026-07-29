import { Header, BottomNav } from '@/components/layout/Header';
import { LandlordDashboard } from '@/components/views/LandlordDashboard';

export default function LandlordDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <LandlordDashboard />
      </main>
      <BottomNav />
    </div>
  );
}
