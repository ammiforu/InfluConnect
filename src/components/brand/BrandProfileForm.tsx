'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { brandProfileSchema, type BrandProfileFormData } from '@/lib/validations';
import { NICHE_OPTIONS } from '@/utils/constants';
import type { Brand } from '@/types';
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

interface BrandProfileFormProps {
  brand?: Brand | null;
  onSubmit: (data: BrandProfileFormData) => Promise<void>;
  onUploadLogo?: (file: File) => Promise<string>;
  isLoading?: boolean;
}

export function BrandProfileForm({ 
  brand, 
  onSubmit, 
  onUploadLogo, 
  isLoading 
}: BrandProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    brand?.company_logo_url || null
  );
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BrandProfileFormData>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: {
      company_name: brand?.company_name || '',
      company_description: brand?.company_description || '',
      industry: brand?.industry || '',
      website: brand?.website || '',
      company_logo_url: brand?.company_logo_url || '',
    },
  });

  const watchedIndustry = watch('industry');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const url = await onUploadLogo(file);
      setValue('company_logo_url', url);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmitForm = handleSubmit(async (data) => onSubmit(data));

  return (
    <form onSubmit={onSubmitForm} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={logoPreview || undefined} />
              <AvatarFallback className="text-2xl">
                {brand?.company_name?.substring(0, 2).toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: 400x400px, PNG or JPG
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="Acme Inc."
                {...register('company_name')}
              />
              {errors.company_name && (
                <p className="text-sm text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={watchedIndustry || ''}
                onValueChange={(value) => setValue('industry', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {NICHE_OPTIONS.map((niche) => (
                    <SelectItem key={niche.value} value={niche.value}>
                      {niche.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-destructive">{errors.industry.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://www.example.com"
              {...register('website')}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Company Description *</Label>
            <Textarea
              id="company_description"
              placeholder="Tell influencers about your company, products, and brand values..."
              rows={4}
              {...register('company_description')}
            />
            {errors.company_description && (
              <p className="text-sm text-destructive">{errors.company_description.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading || isUploading}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
