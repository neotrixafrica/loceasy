'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  tenant: { id: string; name: string; avatar: string | null };
}

interface ReviewsData {
  reviews: Review[];
  average: number;
  count: number;
}

export function ReviewsSection({ listingId }: { listingId: string }) {
  const { currentUser } = useAppStore();
  const [data, setData] = useState<ReviewsData>({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!listingId) return;
    try {
      const res = await apiFetch(`/api/reviews?listingId=${listingId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!listingId) {
      setLoading(false);
      return;
    }
    fetchReviews();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || null,
          listingId,
        }),
      });
      if (res.ok) {
        setRating(0);
        setComment('');
        await fetchReviews();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error || 'Erreur lors de la publication');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showForm = currentUser?.role === 'tenant';

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

  const renderStars = (value: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i <= Math.round(value) ? 'fill-accent text-accent' : 'text-muted-foreground/40'
          )}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="font-display mb-3 text-lg font-semibold text-foreground">Avis</h2>
        <p className="text-sm text-muted-foreground">Chargement des avis...</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="font-display mb-3 text-lg font-semibold text-foreground">Avis</h2>

      <div className="mb-4 flex items-center gap-2">
        {renderStars(data.average)}
        <span className="text-sm font-medium text-foreground">
          {data.average > 0 ? data.average.toFixed(1) : '—'}
        </span>
        <span className="text-sm text-muted-foreground">· {data.count} avis</span>
      </div>

      {data.count === 0 && (
        <p className="mb-4 text-sm text-muted-foreground">Aucun avis pour le moment.</p>
      )}

      <div className="mb-6 space-y-4">
        {data.reviews.map((review) => (
          <div key={review.id} className="rounded-xl border bg-muted p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{review.tenant.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
              </div>
              {renderStars(review.rating)}
            </div>
            {review.comment && (
              <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Donner mon avis</p>
          <div className="mb-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5"
                aria-label={`${i} étoiles`}
              >
                <Star
                  className={cn(
                    'h-6 w-6',
                    i <= (hoverRating || rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted-foreground/40'
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="mb-3 min-h-[80px] text-sm"
          />
          {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            Publier
          </Button>
        </form>
      )}
    </div>
  );
}
