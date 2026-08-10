'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { User, Lang } from '@/types';

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
    <div className="flex-1 flex items-center justify-center px-4 py-8 bg-muted/30">
      <div className="w-full max-w-md">
        <AuthHeader lang={lang} />

        <Card className="border shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="text-primary font-medium hover:underline"
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

function AuthHeader({ lang }: { lang: Lang }) {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-4">
        <Logo showText={false} className="scale-150" />
      </div>
      <h1 className="font-display text-2xl font-bold text-foreground">{t('nav.login', lang)}</h1>
      <p className="text-sm text-muted-foreground mt-1">LocEasy</p>
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
