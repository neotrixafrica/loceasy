import { Header, BottomNav } from '@/components/layout/Header';
import { ProfilePage } from '@/components/views/ProfilePage';

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <ProfilePage />
      </main>
      <BottomNav />
    </div>
  );
}
