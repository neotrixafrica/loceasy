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
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { User } from '@/types';

const STEPS = [
  { id: 1, title: 'Informations' },
  { id: 2, title: 'Mot de passe' },
  { id: 3, title: 'Confirmation' },
];

export function RegisterPage() {
  const { lang, login } = useAppStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'tenant' | 'landlord'>('tenant');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && (!name || !email || !phone)) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (step === 2 && password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

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

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-6">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step === s.id
                      ? 'bg-primary text-primary-foreground scale-110'
                      : step > s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{s.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 transition-all ${
                    step > s.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border shadow-xl">
          <CardContent className="pt-8">
            <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-5">
              {step === 1 && (
                <>
                  <div className="space-y-4">
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
                  </div>
                  <Button type="submit" className="w-full" size="lg">
                    {t('common.next', lang)} <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-4">
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
                      <p className="text-xs text-muted-foreground mt-1">Minimum 6 caractères</p>
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
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                      <ChevronLeft className="mr-2 w-4 h-4" /> {t('common.back', lang)}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {t('common.next', lang)} <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t('auth.name', lang)}</p>
                      <p className="font-medium">{name}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t('auth.email', lang)}</p>
                      <p className="font-medium">{email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t('auth.phone', lang)}</p>
                      <p className="font-medium">{phone}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{t('auth.role', lang)}</p>
                      <p className="font-medium">{role === 'tenant' ? t('auth.role.tenant', lang) : t('auth.role.landlord', lang)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={handleBack}>
                      <ChevronLeft className="mr-2 w-4 h-4" /> {t('common.back', lang)}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? t('common.loading', lang) : t('auth.register.submit', lang)}
                    </Button>
                  </div>
                </>
              )}
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
