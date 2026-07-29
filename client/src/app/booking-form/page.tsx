'use client';

import { useSearchParams } from 'next/navigation';
import { Header, BottomNav } from '@/components/layout/Header';
import { BookingFormPage } from '@/components/views/BookingFormPage';

export default function BookingForm() {
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId') ?? undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col">
        <BookingFormPage listingId={listingId} />
      </main>
      <BottomNav />
    </div>
  );
}
