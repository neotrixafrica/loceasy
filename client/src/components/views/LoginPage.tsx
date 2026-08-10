'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

export function LoginPage() {
  const { lang, login } = useAppStore();
  const router = useRouter();
  const [email, setEmail] = useState('komlan@student.tg');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.auth.login(email, password) as User;
      login(user);
      toast.success(t('auth.success', lang));
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.error', lang);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <AuthHeader />

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

            <DemoAccounts
              lang={lang}
              setEmail={setEmail}
              setPassword={setPassword}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AuthHeader() {
  return (
    <div className="text-center mb-8">
      <div className="w-12 h-12 bg-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold">LocEasy</h1>
    </div>
  );
}

function DemoAccounts({
  lang,
  setEmail,
  setPassword,
}: {
  lang: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}) {
  const accounts = [
    { label: lang === 'fr' ? 'Étudiant' : 'Student', email: 'komlan@student.tg' },
    { label: lang === 'fr' ? 'Propriétaire' : 'Landlord', email: 'mensah@proprio.tg' },
  ];

  return (
    <div className="mt-6 border-t pt-4">
      <p className="text-xs text-muted-foreground text-center mb-3">
        {lang === 'fr' ? 'Comptes de démonstration :' : 'Demo accounts:'}
      </p>
      <div className="space-y-2 text-xs">
        {accounts.map((acc) => (
          <button
            key={acc.email}
            className="w-full text-left p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            onClick={() => { setEmail(acc.email); setPassword('password123'); }}
          >
            <span className="font-medium">{acc.label}</span> — {acc.email}
          </button>
        ))}
      </div>
    </div>
  );
}
