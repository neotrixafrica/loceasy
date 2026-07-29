'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { WifiOff, RefreshCw } from 'lucide-react';

export function ServiceWorkerRegistrar() {
  const { lang } = useAppStore();
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    // Track online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);

          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') {
                  // New content is available, could prompt user to refresh
                  console.log('New content available');
                }
              });
            }
          });
        })
        .catch((err) => {
          console.log('SW registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide offline banner when back online
  useEffect(() => {
    if (isOnline && showOfflineBanner) {
      const timer = setTimeout(() => setShowOfflineBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineBanner]);

  if (!showOfflineBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <WifiOff className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-amber-800">{t('offline.title', lang)}</h4>
            <p className="text-xs text-amber-700 mt-0.5">{t('offline.message', lang)}</p>
          </div>
          <button
            className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            onClick={() => setShowOfflineBanner(false)}
          >
            <RefreshCw className="h-4 w-4 text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
