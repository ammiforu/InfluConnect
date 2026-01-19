'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createRequestSchema, type CreateRequestFormData } from '@/lib/validations';
import { createRequest } from '@/services/request.service';

interface SendRequestFormProps {
  influencerId: string;
  brandId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SendRequestForm({ influencerId, brandId, onSuccess, onCancel }: SendRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      influencer_id: influencerId,
      campaign_title: '',
      campaign_description: '',
      requirements: '',
      budget: 0,
      start_date: '',
      end_date: '',
    },
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await createRequest(brandId, {
        influencer_id: influencerId,
        campaign_title: data.campaign_title,
        campaign_description: data.campaign_description,
        requirements: data.requirements,
        budget: data.budget,
        start_date: data.start_date,
        end_date: data.end_date,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Failed to send request:', err);
      setError(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campaign_title">Campaign Title *</Label>
          <Input
            id="campaign_title"
            placeholder="Summer Collection Launch"
            {...register('campaign_title')}
          />
          {errors.campaign_title && (
            <p className="text-sm text-destructive">{errors.campaign_title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign_description">Description *</Label>
          <Textarea
            id="campaign_description"
            placeholder="Describe your campaign goals and what you're looking for..."
            rows={4}
            {...register('campaign_description')}
          />
          {errors.campaign_description && (
            <p className="text-sm text-destructive">{errors.campaign_description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements (Optional)</Label>
          <Textarea
            id="requirements"
            placeholder="List any specific requirements, deliverables, or expectations..."
            rows={3}
            {...register('requirements')}
          />
          {errors.requirements && (
            <p className="text-sm text-destructive">{errors.requirements.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Budget ($) *</Label>
            <Input
              id="budget"
              type="number"
              min="0"
              placeholder="1000"
              {...register('budget', { valueAsNumber: true })}
            />
            {errors.budget && (
              <p className="text-sm text-destructive">{errors.budget.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
            />
            {errors.start_date && (
              <p className="text-sm text-destructive">{errors.start_date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date *</Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date')}
            />
            {errors.end_date && (
              <p className="text-sm text-destructive">{errors.end_date.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" disabled={isLoading} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Request'}
        </Button>
      </div>
    </form>
  );
}
