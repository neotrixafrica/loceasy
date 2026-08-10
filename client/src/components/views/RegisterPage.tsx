'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api } from '@/lib/api';
import { t } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/shared/Logo';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';

export function RegisterPage() {
  const { lang, login } = useAppStore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.auth.register({ name, email, password, phone, role }) as User;
      login(user);
      toast.success(t('auth.register.success', lang));
      router.push('/');
    } catch (error) {
      const message = error instanceof Error ? error.message : t('common.error', lang);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo showText={false} className="scale-150" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t('auth.register.title', lang)}</h1>
        </div>

        <Card className="border shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('auth.name', lang)}</label>
                <Input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Kofi Mensah"
                  required
                />
              </div>
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
                <label className="text-sm font-medium mb-1.5 block">{t('auth.phone', lang)}</label>
                <Input
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+228 90 12 34 56"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('auth.password', lang)}</label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('auth.role', lang)}</label>
                <Select value={role} onValueChange={(value) => setRole(value as 'tenant' | 'landlord')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">{t('auth.role.tenant', lang)}</SelectItem>
                    <SelectItem value="landlord">{t('auth.role.landlord', lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t('common.loading', lang) : t('auth.register.submit', lang)}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('auth.hasAccount', lang)}{' '}
                <button
                  className="text-primary font-medium hover:underline"
                  onClick={() => router.push('/login')}
                >
                  {t('nav.login', lang)}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
