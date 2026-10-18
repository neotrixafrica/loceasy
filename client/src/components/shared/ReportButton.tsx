'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportButtonProps {
  targetType: 'user' | 'listing' | 'message';
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = {
  user: [
    'Faux profil',
    'Comportement inapproprié',
    'Tentative d\'arnaque',
    'Hébergement de contenu frauduleux',
    'Autre',
  ],
  listing: [
    'Annonce trompeuse',
    'Logement inexistant',
    'Prix mensonger',
    'Photos non authentiques',
    'Déjà loué mais toujours proposé',
    'Autre',
  ],
  message: [
    'Harcèlement',
    'Contenu inapproprié',
    'Tentative d\'arnaque',
    'Spam',
    'Autre',
  ],
};

export function ReportButton({ targetType, targetId, targetTitle }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    try {
      const targetKey = targetType === 'user' ? 'targetUserId' : 
                        targetType === 'listing' ? 'targetListingId' : 'targetMessageId';
      
      await apiPost('/api/reports', {
        type: targetType,
        reason,
        description,
        [targetKey]: targetId,
      });

      toast.success('Signalement envoyé avec succès');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
      >
        <Flag className="h-4 w-4 mr-1" />
        Signaler
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">
                Signaler {targetType === 'user' ? 'cet utilisateur' : targetType === 'listing' ? 'cette annonce' : 'ce message'}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {targetTitle && <span className="block mt-1">{targetTitle}</span>}
              Aidez-nous à maintenir LocEasy sûr pour tous.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Raison du signalement</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-10 rounded-lg border border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Sélectionnez une raison</option>
                  {REPORT_REASONS[targetType].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optionnel)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
