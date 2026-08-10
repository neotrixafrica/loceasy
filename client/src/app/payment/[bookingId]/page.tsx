import { Header, BottomNav } from '@/components/layout/Header';
import { PaymentPage } from '@/components/views/PaymentPage';

export default function Payment({ params }: { params: Promise<{ bookingId: string }> }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <PaymentPage params={params} />
      </main>
      <BottomNav />
    </div>
  );
}
