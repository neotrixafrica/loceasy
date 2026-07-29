'use client';

import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Bell, Check, CheckCheck, Trash2, ChevronLeft, MapPin, MessageCircle, CalendarDays, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

export function NotificationsPage() {
  const { lang, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useAppStore();
  const router = useRouter();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return lang === 'fr' ? 'À l\'instant' : 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHour < 24) return `${diffHour}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <CalendarDays className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getIconBg = (type: string, read: boolean) => {
    if (read) return 'bg-muted text-muted-foreground';
    switch (type) {
      case 'booking':
        return 'bg-amber-100 text-amber-700';
      case 'message':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-700" />
              {t('notifications.title', lang)}
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {unreadCount} {t('notifications.unread', lang)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllNotificationsRead} className="text-xs">
              <CheckCheck className="h-4 w-4 mr-1" />
              {t('notifications.markAllRead', lang)}
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearNotifications} className="text-xs text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              {t('notifications.clear', lang)}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('notifications.empty', lang)}</h3>
          <p className="text-muted-foreground text-sm">{t('notifications.empty.desc', lang)}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              className={`w-full text-left p-4 rounded-xl border transition-colors ${
                notification.read
                  ? 'bg-card hover:bg-muted/50'
                  : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200'
              }`}
              onClick={() => {
                if (!notification.read) markNotificationRead(notification.id);
                if (notification.link) {
                  const parts = notification.link.split(':');
                  if (parts.length === 2 && parts[0] === 'conversation') {
                    router.push(`/messages/${parts[1]}`);
                  } else if (parts[0] === 'messages') {
                    router.push('/messages');
                  }
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBg(notification.type, notification.read)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-muted-foreground">{formatTime(notification.createdAt)}</span>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notification.body}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
