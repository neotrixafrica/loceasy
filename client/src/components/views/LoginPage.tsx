'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function LoginPage() {
  const { lang } = useAppStore();
  const router = useRouter();
  const [email, setEmail] = useState('komlan@student.tg');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const user = await res.json();
        useAppStore.getState().login(user);
        toast.success(t('auth.success', lang));
        router.push('/');
      } else {
        toast.error(t('auth.error', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">{t('auth.login.title', lang)}</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('auth.email', lang)}</label>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.tg"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('auth.password', lang)}</label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('common.loading', lang) : t('auth.submit', lang)}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount', lang)}{' '}
                <button
                  className="text-emerald-700 font-medium hover:underline"
                  onClick={() => router.push('/register')}
                >
                  {t('nav.register', lang)}
                </button>
              </p>
            </div>

            {/* Demo accounts */}
            <div className="mt-6 border-t pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">
                {lang === 'fr' ? 'Comptes de démonstration :' : 'Demo accounts:'}
              </p>
              <div className="space-y-2 text-xs">
                <button
                  className="w-full text-left p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => { setEmail('komlan@student.tg'); setPassword('password123'); }}
                >
                  <span className="font-medium">Komlan</span> — {lang === 'fr' ? 'Étudiant' : 'Student'}
                </button>
                <button
                  className="w-full text-left p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => { setEmail('mensah@proprio.tg'); setPassword('password123'); }}
                >
                  <span className="font-medium">Mensah</span> — {lang === 'fr' ? 'Propriétaire' : 'Landlord'}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
