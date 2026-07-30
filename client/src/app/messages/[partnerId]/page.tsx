'use client';

import { useParams } from 'next/navigation';
import { Header, BottomNav } from '@/components/layout/Header';
import { MessagesPage } from '@/components/views/MessagesPage';

export default function Conversation() {
  const { partnerId } = useParams() as { partnerId: string };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <MessagesPage partnerId={partnerId} />
      </main>
      <BottomNav />
    </div>
  );
}
