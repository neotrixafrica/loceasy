'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiUpload } from '@/lib/api';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      const url = await apiUpload(file);
      onChange(url);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      alert(msg);
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayUrl = preview || value;

  return (
    <div className="flex items-start gap-3">
      {displayUrl ? (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
          <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs">...</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => { onChange(''); setPreview(null); }}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center"
            disabled={disabled || uploading}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 space-y-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={disabled || uploading}
        />
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onFileChange}
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            <Upload className="h-3 w-3 mr-1" />
            {uploading ? '...' : 'Upload'}
          </Button>
        </div>
      </div>
    </div>
  );
}
