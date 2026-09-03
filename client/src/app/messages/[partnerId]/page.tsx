'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { MessagesPage } from '@/components/views/MessagesPage';

function ConversationContent() {
  const { partnerId } = useParams() as { partnerId: string };
  const searchParams = useSearchParams();
  const partnerName = searchParams.get('name') || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-20">
        <MessagesPage partnerId={partnerId} partnerName={partnerName} />
      </main>
    </div>
  );
}

export default function Conversation() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <ConversationContent />
    </Suspense>
  );
}
