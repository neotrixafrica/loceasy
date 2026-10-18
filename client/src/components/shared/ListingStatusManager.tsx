'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { CheckCircle, Clock, Lock, XCircle } from 'lucide-react';

type ListingStatus = 'available' | 'viewing_in_progress' | 'reserved' | 'rented';

interface ListingStatusManagerProps {
  listingId: string;
  currentStatus: ListingStatus;
  isOwner: boolean;
}

const statusConfig = {
  available: {
    label: 'Disponible',
    description: 'Le logement est disponible à la location',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  viewing_in_progress: {
    label: 'Visite en cours',
    description: 'Des candidats visitent actuellement le logement',
    icon: Clock,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  reserved: {
    label: 'Réservé',
    description: 'Le logement est réservé en attente de paiement',
    icon: Lock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  rented: {
    label: 'Loué',
    description: 'Le logement est actuellement loué',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
};

export function ListingStatusManager({ listingId, currentStatus, isOwner }: ListingStatusManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const config = statusConfig[currentStatus];
  const Icon = config.icon;

  const handleStatusChange = async (newStatus: ListingStatus) => {
    if (!isOwner) {
      toast.error('Vous devez être le propriétaire pour modifier le statut');
      return;
    }

    setIsUpdating(true);
    try {
      await api.listings.updateStatus(listingId, newStatus);
      toast.success('Statut mis à jour avec succès');
      setIsOpen(false);
      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOwner) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div>
          <p className={`font-medium ${config.color}`}>{config.label}</p>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity ${config.bgColor} ${config.borderColor}`}
      >
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div className="text-left">
          <p className={`font-medium ${config.color}`}>{config.label}</p>
          <p className="text-sm text-gray-600">{config.description}</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            {Object.entries(statusConfig).map(([status, cfg]) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as ListingStatus)}
                disabled={isUpdating || status === currentStatus}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                <div className="text-left">
                  <p className={`font-medium text-sm ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-xs text-gray-600">{cfg.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
