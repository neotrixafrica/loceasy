import { Header, BottomNav } from '@/components/layout/Header';
import { NotificationsPage } from '@/components/views/NotificationsPage';

export default function Notifications() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <NotificationsPage />
      </main>
      <BottomNav />
    </div>
  );
}
