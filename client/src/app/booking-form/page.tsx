'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header, BottomNav } from '@/components/layout/Header';
import { BookingFormPage } from '@/components/views/BookingFormPage';

function BookingFormContent() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') ?? undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-20 pb-20 md:pb-0">
        <BookingFormPage listingId={listingId} />
      </main>
      <BottomNav />
    </div>
  );
}

export default function BookingForm() {
  return (
    <Suspense>
      <BookingFormContent />
    </Suspense>
  );
}
