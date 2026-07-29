'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { t, TOGO_CITIES, TOGO_QUARTIERS, AMENITIES_LIST } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, X } from 'lucide-react';

export function AddListingPage() {
  const { lang, navigate, currentUser } = useAppStore();
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

  const quartiers = form.city ? (TOGO_QUARTIERS[form.city] || []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { navigate('login'); return; }

    setLoading(true);
    try {
      const res = await apiFetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          rooms: Number(form.rooms),
          area: form.area ? Number(form.area) : null,
          amenities,
          images: imageUrls.filter(Boolean),
          landlordId: currentUser.id,
        }),
      });
      if (res.ok) {
        toast.success(t('addListing.success', lang));
        navigate('landlord-dashboard');
      } else {
        toast.error(t('common.error', lang));
      }
    } catch {
      toast.error(t('common.error', lang));
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  if (!currentUser) {
    navigate('login');
    return null;
  }

  return (
    <div className="flex-1 container mx-auto px-4 md:px-6 py-6 max-w-2xl">
      <h1 className="text-xl md:text-2xl font-bold mb-6">{t('addListing.title', lang)}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('addListing.titleField', lang)}</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={lang === 'fr' ? 'Chambre meublée à Lomé' : 'Furnished room in Lomé'}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('addListing.description', lang)}</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={lang === 'fr' ? 'Décrivez votre logement en détail...' : 'Describe your listing in detail...'}
                rows={4}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.price', lang)}</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="50000"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.type', lang)}</label>
                <Select value={form.type} onValueChange={(val) => setForm({ ...form, type: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chambre">{t('type.chambre', lang)}</SelectItem>
                    <SelectItem value="studio">{t('type.studio', lang)}</SelectItem>
                    <SelectItem value="appartement">{t('type.appartement', lang)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.city', lang)}</label>
                <Select value={form.city} onValueChange={(val) => setForm({ ...form, city: val, quartier: '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.city.all', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {TOGO_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.quartier', lang)}</label>
                <Select value={form.quartier} onValueChange={(val) => setForm({ ...form, quartier: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('search.quartier.all', lang)} />
                  </SelectTrigger>
                  <SelectContent>
                    {quartiers.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{t('addListing.address', lang)}</label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={lang === 'fr' ? 'Rue principale, Quartier' : 'Main street, Neighborhood'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.rooms', lang)}</label>
                <Input
                  type="number"
                  value={form.rooms}
                  onChange={(e) => setForm({ ...form, rooms: e.target.value })}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t('addListing.area', lang)}</label>
                <Input
                  type="number"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="25"
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="text-sm font-medium mb-2 block">{t('addListing.amenities', lang)}</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      amenities.includes(amenity)
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                        : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                    }`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardContent className="p-5 space-y-3">
            <label className="text-sm font-medium block">{t('addListing.images', lang)}</label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {imageUrls.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
              <PlusCircle className="h-3 w-3 mr-1" />
              {lang === 'fr' ? 'Ajouter une image' : 'Add image'}
            </Button>
          </CardContent>
        </Card>

        {/* Rules */}
        <Card>
          <CardContent className="p-5">
            <label className="text-sm font-medium mb-1.5 block">{t('addListing.rules', lang)}</label>
            <Textarea
              value={form.rules}
              onChange={(e) => setForm({ ...form, rules: e.target.value })}
              placeholder={lang === 'fr' ? 'Pas d\'animaux, caution d\'un mois...' : 'No pets, one month deposit...'}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('landlord-dashboard')}>
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
