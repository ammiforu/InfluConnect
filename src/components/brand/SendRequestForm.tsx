'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import { createRequestSchema, type CreateRequestFormData } from '@/lib/validations';
import { DELIVERABLE_TYPE_OPTIONS } from '@/utils/constants';
import { Plus, Trash2 } from 'lucide-react';

interface SendRequestFormProps {
  influencerId: string;
  onSubmit: (data: CreateRequestFormData) => Promise<void>;
  isLoading?: boolean;
}

export function SendRequestForm({ influencerId, onSubmit, isLoading }: SendRequestFormProps) {
  const [deliverables, setDeliverables] = useState([
    { title: '', description: '', type: 'post' as const, quantity: 1 }
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      influencer_id: influencerId,
      campaign_title: '',
      campaign_description: '',
      budget: 0,
      start_date: '',
      end_date: '',
      deadline: '',
      deliverables: deliverables,
    },
  });

  const addDeliverable = () => {
    const newDeliverable = { title: '', description: '', type: 'post' as const, quantity: 1 };
    setDeliverables([...deliverables, newDeliverable]);
  };

  const removeDeliverable = (index: number) => {
    if (deliverables.length > 1) {
      setDeliverables(deliverables.filter((_, i) => i !== index));
    }
  };

  const updateDeliverable = (
    index: number,
    field: keyof CreateRequestFormData['deliverables'][number],
    value: string | number
  ) => {
    const updated = deliverables.map((d, i) =>
      i === index ? { ...d, [field]: value } : d
    );
    setDeliverables(updated);
    setValue('deliverables', updated);
  };

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      deliverables,
    });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input
                id="deadline"
                type="date"
                {...register('deadline')}
              />
              {errors.deadline && (
                <p className="text-sm text-destructive">{errors.deadline.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Deliverables</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
            <Plus className="h-4 w-4 mr-1" />
            Add Deliverable
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {deliverables.map((deliverable, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Deliverable {index + 1}</span>
                {deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDeliverable(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Instagram Post"
                    value={deliverable.title}
                    onChange={(e) => updateDeliverable(index, 'title', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={deliverable.type}
                    onValueChange={(value) => updateDeliverable(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERABLE_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={deliverable.quantity}
                    onChange={(e) => updateDeliverable(index, 'quantity', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what you expect for this deliverable..."
                    value={deliverable.description || ''}
                    onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          {errors.deliverables && (
            <p className="text-sm text-destructive">{errors.deliverables.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Request'}
        </Button>
      </div>
    </form>
  );
}
