'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { useEffect, useRef } from 'react';

/**
 * Polls for unread messages and new bookings periodically.
 * Triggers in-app notifications via Zustand store.
 * Works alongside the service worker for browser notifications.
 */
export function useNotificationPolling() {
  const { currentUser, lang, addNotification } = useAppStore();
  const lastMessageCount = useRef(0);
  const lastBookingCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const poll = async () => {
      try {
        // Check for new messages
        const msgRes = await fetch(`/api/messages?userId=${currentUser.id}`);
        if (msgRes.ok) {
          const conversations = await msgRes.json();
          const totalUnread = conversations.reduce((sum: number, c: any) => sum + (c.unread || 0), 0);
          if (totalUnread > lastMessageCount.current && lastMessageCount.current > 0) {
            addNotification({
              type: 'message',
              title: lang === 'fr' ? 'Nouveau message' : 'New message',
              body: lang === 'fr'
                ? `Vous avez ${totalUnread} message(s) non lu(s)`
                : `You have ${totalUnread} unread message(s)`,
              link: 'messages',
            });
          }
          lastMessageCount.current = totalUnread;
        }

        // Check for new bookings (for landlords)
        if (currentUser.role === 'landlord') {
          const bookRes = await fetch(`/api/bookings?landlordId=${currentUser.id}`);
          if (bookRes.ok) {
            const bookings = await bookRes.json();
            const pendingCount = bookings.filter((b: any) => b.status === 'pending').length;
            if (pendingCount > lastBookingCount.current && lastBookingCount.current > 0) {
              addNotification({
                type: 'booking',
                title: lang === 'fr' ? 'Nouvelle demande' : 'New request',
                body: lang === 'fr'
                  ? `${pendingCount} demande(s) de réservation en attente`
                  : `${pendingCount} booking request(s) pending`,
              });
            }
            lastBookingCount.current = pendingCount;
          }
        }
      } catch {
        // Silently fail - polling is best-effort
      }
    };

    // Initial poll
    poll();

    // Poll every 30 seconds
    intervalRef.current = setInterval(poll, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentUser, lang, addNotification]);
}
