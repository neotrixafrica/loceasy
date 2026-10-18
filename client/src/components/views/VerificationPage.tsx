'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { api, apiUpload } from '@/lib/api';
import { t } from '@/lib/translations';
import { compressImage } from '@/lib/image-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ShieldCheck, Smartphone, Upload, CheckCircle2, Clock, XCircle, FileImage, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Téléphone' },
  { id: 2, title: 'Identité' },
];

export function VerificationPage() {
  const { lang, currentUser } = useAppStore();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreview, setDocPreview] = useState<string>('');
  const [docType, setDocType] = useState<'id_card' | 'passport' | 'driving_license'>('id_card');
  const [uploading, setUploading] = useState(false);

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);
    try {
      const response = await api.verification.sendPhoneOtp(phone);
      
      if (response.otp) {
        toast.success(`OTP envoyé (développement): ${response.otp}`);
      } else {
        toast.success('OTP envoyé par SMS');
      }
      
      setOtpSent(true);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error('Veuillez entrer le code OTP');
      return;
    }

    setLoading(true);
    try {
      await api.verification.verifyPhoneOtp(otp);
      toast.success('Téléphone vérifié avec succès');
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || 'Code OTP invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 10MB');
      return;
    }

    setUploading(true);
    try {
      // Compress and convert to WebP
      const compressedFile = await compressImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocPreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      setDocFile(compressedFile);
      toast.success('Image compressée et convertie en WebP');
    } catch (error) {
      toast.error('Erreur lors du traitement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setDocFile(null);
    setDocPreview('');
  };

  const handleSubmitIdentity = async () => {
    if (!docFile) {
      toast.error('Veuillez sélectionner une image de votre document');
      return;
    }

    setLoading(true);
    try {
      // Upload the file
      const uploadedUrl = await apiUpload(docFile);

      // Submit verification
      await api.verification.submitIdentity(uploadedUrl, docType);
      toast.success('Document soumis avec succès');
      setDocFile(null);
      setDocPreview('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la soumission du document');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 bg-muted/30">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="h-16 w-16 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Vérification de compte</h1>
          <p className="text-muted-foreground mt-2">
            Obtenez le badge de confiance pour augmenter votre visibilité
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    step === s.id
                      ? 'bg-primary text-primary-foreground scale-110'
                      : step > s.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : s.id}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{s.title}</span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn('w-16 h-0.5 mx-2 transition-all', step > s.id ? 'bg-primary' : 'bg-muted')}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border shadow-xl">
          <CardContent className="pt-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Smartphone className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h2 className="font-display text-lg font-bold text-foreground">Vérification du téléphone</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nous enverrons un code SMS pour vérifier votre numéro
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Numéro de téléphone</label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+228 90 12 34 56"
                      disabled={currentUser.phoneVerified}
                    />
                    {currentUser.phoneVerified && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Téléphone déjà vérifié
                      </p>
                    )}
                  </div>

                  {!otpSent && !currentUser.phoneVerified && (
                    <Button
                      onClick={handleSendOtp}
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? 'Envoi...' : 'Envoyer le code'}
                    </Button>
                  )}

                  {(otpSent || currentUser.phoneVerified) && !currentUser.phoneVerified && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Code OTP</label>
                        <Input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                        />
                      </div>
                      <Button
                        onClick={handleVerifyOtp}
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? 'Vérification...' : 'Vérifier'}
                      </Button>
                      <button
                        onClick={handleSendOtp}
                        className="w-full text-sm text-muted-foreground hover:text-foreground"
                        disabled={loading}
                      >
                        Renvoyer le code
                      </button>
                    </div>
                  )}
                </div>

                {currentUser.phoneVerified && (
                  <div className="flex justify-end">
                    <Button onClick={() => setStep(2)}>
                      Continuer
                    </Button>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h2 className="font-display text-lg font-bold text-foreground">Vérification d'identité</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Soumettez une pièce d'identité valide
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Type de document</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full h-10 rounded-lg border border bg-card px-3 text-sm text-foreground outline-none focus:border-primary"
                    >
                      <option value="id_card">Carte d'identité</option>
                      <option value="passport">Passeport</option>
                      <option value="driving_license">Permis de conduire</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Document d'identité</label>
                    {!docPreview ? (
                      <div className="relative">
                        <input
                          type="file"
                          id="doc-upload"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={uploading}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                          <FileImage className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-sm text-foreground font-medium">
                            {uploading ? 'Traitement en cours...' : 'Cliquez pour sélectionner une image'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG, WEBP (max 10MB)
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            L'image sera convertie en WebP et compressée
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={docPreview}
                          alt="Aperçu du document"
                          className="w-full h-64 object-contain bg-muted"
                        />
                        <button
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {docFile?.name}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={handleSubmitIdentity}
                    className="w-full"
                    disabled={loading || !docFile}
                  >
                    {loading ? 'Soumission...' : 'Soumettre'}
                  </Button>
                </div>

                {/* Status Display */}
                {currentUser.verificationStatus && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                      {currentUser.verificationStatus === 'verified' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {currentUser.verificationStatus === 'pending' && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {currentUser.verificationStatus === 'rejected' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium text-foreground">
                        {currentUser.verificationStatus === 'verified' && 'Identité vérifiée'}
                        {currentUser.verificationStatus === 'pending' && 'En cours de vérification'}
                        {currentUser.verificationStatus === 'rejected' && 'Vérification rejetée'}
                      </span>
                    </div>
                    {currentUser.verificationRejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        {currentUser.verificationRejectionReason}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
