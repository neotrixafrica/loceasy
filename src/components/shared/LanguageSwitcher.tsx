"use client";

import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { lang, setLang } = useAppStore();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
      className="gap-1 text-xs font-medium"
    >
      <Languages className="w-3.5 h-3.5" />
      {lang === 'fr' ? 'EN' : 'FR'}
    </Button>
  );
}