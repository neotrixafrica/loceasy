'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  images: string[];
  current: number;
  isOpen: boolean;
  onClose: () => void;
  onChange: (index: number) => void;
}

export function ImageLightbox({ images, current, isOpen, onClose, onChange }: ImageLightboxProps) {
  const goNext = useCallback(() => {
    onChange((current + 1) % images.length);
  }, [current, images.length, onChange]);

  const goPrev = useCallback(() => {
    onChange((current - 1 + images.length) % images.length);
  }, [current, images.length, onChange]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-foreground/20 p-2 text-background hover:bg-foreground/30 transition"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-foreground/20 p-3 text-background hover:bg-foreground/30 transition"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <img
        src={images[current]}
        alt="Aperçu"
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
      />

      {images.length > 1 && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-foreground/20 p-3 text-background hover:bg-foreground/30 transition"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={cn(
              'h-2 w-2 rounded-full transition',
              i === current ? 'bg-background' : 'bg-background/40'
            )}
          />
        ))}
      </div>
    </div>
  );
}
