import { Header, BottomNav } from '@/components/layout/Header';
import { MessagesPage } from '@/components/views/MessagesPage';

export default function Messages() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <MessagesPage />
      </main>
      <BottomNav />
    </div>
  );
}
