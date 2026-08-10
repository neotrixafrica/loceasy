'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { api, ApiError } from '@/lib/api';
import { t, TOGO_CITIES, TOGO_QUARTIERS, AMENITIES_LIST } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, X } from 'lucide-react';
import { ImageUploader } from '@/components/shared/ImageUploader';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TYPES = ['chambre', 'studio', 'appartement', 'maison', 'bureau'] as const;

export function AddListingPage() {
  const { lang, currentUser } = useAppStore();
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    type: 'chambre',
    city: '',
    quartier: '',
    address: '',
    rooms: '1',
    area: '',
    rules: '',
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else if (currentUser.role !== 'landlord') {
      router.push('/register');
    }
  }, [currentUser, router]);

  const quartiers = form.city ? (TOGO_QUARTIERS[form.city] || []) : [];

  const updateField = (field: keyof typeof form, value: string) => {
    if (field === 'city') {
      setForm((prev) => ({ ...prev, city: value, quartier: '' }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addImageUrl = () => setImageUrls([...imageUrls, '']);
  const removeImageUrl = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index));
  const updateImageUrl = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      await api.listings.create({
        ...form,
        price: Number(form.price),
        rooms: form.rooms ? Number(form.rooms) : null,
        area: form.area ? Number(form.area) : null,
        amenities,
        images: imageUrls.filter(Boolean),
      });
      toast.success(t('addListing.success', lang));
      router.push('/landlord-dashboard');
    } catch (error) {
      const detail = error instanceof ApiError ? (error.data as { error?: string })?.error : undefined;
      const msg = detail || (error instanceof Error ? error.message : t('common.error', lang));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-2xl">
      <h1 className="font-display text-xl md:text-2xl font-bold mb-6">{t('addListing.title', lang)}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-5 space-y-4">
            <FormField label={t('addListing.titleField', lang)}>
              <Input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder={t('addListing.titlePlaceholder', lang)}
                required
              />
            </FormField>

            <FormField label={t('addListing.description', lang)}>
              <Textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder={t('addListing.descriptionPlaceholder', lang)}
                rows={4}
                required
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('addListing.price', lang)}>
                <Input
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="50000"
                  required
                />
              </FormField>

              <FormField label={t('addListing.type', lang)}>
                <Select value={form.type} onValueChange={(val) => updateField('type', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t(`type.${type}`, lang)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('addListing.city', lang)}>
                <Select value={form.city} onValueChange={(val) => updateField('city', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.city.all', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {TOGO_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label={t('addListing.quartier', lang)}>
                <Select value={form.quartier} onValueChange={(val) => updateField('quartier', val)} disabled={!form.city}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.quartier.all', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField label={t('addListing.address', lang)}>
              <Input
                value={form.address}
                onChange={(e) => updateField('address', e.target.value)}
                placeholder={t('addListing.addressPlaceholder', lang)}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('addListing.rooms', lang)}>
                <Input
                  type="number"
                  value={form.rooms}
                  onChange={(e) => updateField('rooms', e.target.value)}
                  min={1}
                />
              </FormField>

              <FormField label={t('addListing.area', lang)}>
                <Input
                  type="number"
                  value={form.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  placeholder="25"
                />
              </FormField>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('addListing.amenities', lang)}</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                      amenities.includes(amenity)
                        ? 'bg-primary/10 border-primary/30 text-primary'
                        : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                    )}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <label className="text-sm font-medium block">{t('addListing.images', lang)}</label>
            {imageUrls.map((url, index) => (
              <div key={index} className="space-y-2">
                <ImageUploader value={url} onChange={(value) => updateImageUrl(index, value)} disabled={loading} />
                {imageUrls.length > 1 && (
                  <div className="text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImageUrl(index)}>
                      <X className="h-3 w-3 mr-1" />
                      {t('common.delete', lang)}
                    </Button>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
              <PlusCircle className="h-3 w-3 mr-1" />
              {t('addListing.addImage', lang)}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <FormField label={t('addListing.rules', lang)}>
              <Textarea
                value={form.rules}
                onChange={(e) => updateField('rules', e.target.value)}
                placeholder={t('addListing.rulesPlaceholder', lang)}
                rows={3}
              />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/landlord-dashboard')}>
            {t('common.cancel', lang)}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? t('common.loading', lang) : t('addListing.submit', lang)}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
