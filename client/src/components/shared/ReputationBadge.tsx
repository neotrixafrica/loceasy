'use client';

import { Award, Star, Clock, MessageSquare, CheckCircle, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReputationBadgeProps {
  trustScore: number;
  badge: string;
  totalListings?: number;
  totalBookings?: number;
  completedBookings?: number;
  totalReviews?: number;
  averageRating?: number;
  responseRate?: number;
  responseTime?: number;
  compact?: boolean;
}

const badgeConfig: Record<string, { color: string; bgColor: string; icon: any }> = {
  'Légendaire': { color: 'text-purple-600', bgColor: 'bg-purple-50', icon: Award },
  'Expert': { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: Star },
  'Fiable': { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle },
  'Confirmé': { color: 'text-amber-600', bgColor: 'bg-amber-50', icon: CheckCircle },
  'En progression': { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: Clock },
  'Débutant': { color: 'text-gray-500', bgColor: 'bg-gray-50', icon: Clock },
};

export function ReputationBadge({
  trustScore,
  badge,
  totalListings = 0,
  totalBookings = 0,
  completedBookings = 0,
  totalReviews = 0,
  averageRating = 0,
  responseRate = 0,
  responseTime = 0,
  compact = false,
}: ReputationBadgeProps) {
  const config = badgeConfig[badge] || badgeConfig['Débutant'];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full', config.bgColor)}>
        <Icon className={cn('h-4 w-4', config.color)} />
        <span className={cn('text-sm font-medium', config.color)}>{badge}</span>
        <span className={cn('text-xs font-bold', config.color)}>{Math.round(trustScore)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trust Score & Badge */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', config.bgColor)}>
            <Icon className={cn('h-6 w-6', config.color)} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Badge de réputation</p>
            <p className={cn('text-lg font-bold', config.color)}>{badge}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Score de confiance</p>
          <p className="text-2xl font-bold text-foreground">{Math.round(trustScore)}/100</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">Annonces</p>
          </div>
          <p className="text-lg font-bold text-foreground">{totalListings}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <p className="text-xs text-muted-foreground">Locations</p>
          </div>
          <p className="text-lg font-bold text-foreground">{completedBookings}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Avis</p>
          </div>
          <p className="text-lg font-bold text-foreground">{totalReviews}</p>
        </div>

        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {averageRating > 0 ? averageRating.toFixed(1) : '-'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <p className="text-xs text-muted-foreground">Taux de réponse</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {responseRate > 0 ? `${Math.round(responseRate)}%` : '-'}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-card border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-xs text-muted-foreground">Temps de réponse</p>
          </div>
          <p className="text-lg font-bold text-foreground">
            {responseTime > 0 ? `${responseTime}h` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
