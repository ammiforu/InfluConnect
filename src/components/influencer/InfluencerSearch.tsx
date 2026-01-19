'use client';

import { useState, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { NICHE_OPTIONS, AVAILABILITY_OPTIONS } from '@/utils/constants';
import type { InfluencerSearchParams } from '@/types';
import { debounce } from '@/utils/helpers';

interface InfluencerSearchProps {
  params: InfluencerSearchParams;
  onParamsChange: (params: Partial<InfluencerSearchParams>) => void;
}

export function InfluencerSearch({ params, onParamsChange }: InfluencerSearchProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [localParams, setLocalParams] = useState(params);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      onParamsChange({ query });
    }, 300),
    [onParamsChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const applyFilters = () => {
    onParamsChange(localParams);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    const cleared: Partial<InfluencerSearchParams> = {
      niche: undefined,
      minFollowers: undefined,
      maxFollowers: undefined,
      availability: undefined,
      platform: 'instagram',
    };
    setLocalParams({ ...params, ...cleared });
    onParamsChange(cleared);
    setFilterOpen(false);
  };

  const activeFilterCount = [
    params.niche,
    params.minFollowers,
    params.maxFollowers,
    params.availability,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search influencers by name..."
            className="pl-10"
            defaultValue={params.query}
            onChange={handleSearchChange}
          />
        </div>

        {/* Platform select */}
        <Select
          value={params.platform || 'instagram'}
          onValueChange={(value) => onParamsChange({ platform: value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="youtube">YouTube</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter button */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Influencers</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Niche */}
              <div className="space-y-2">
                <Label>Niche</Label>
                <Select
                  value={localParams.niche || ''}
                  onValueChange={(value) => 
                    setLocalParams({ ...localParams, niche: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any niche" />
                  </SelectTrigger>
                  <SelectContent>
                    {NICHE_OPTIONS.map((niche) => (
                      <SelectItem key={niche.value} value={niche.value}>
                        {niche.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <Select
                  value={localParams.availability || ''}
                  onValueChange={(value) => 
                    setLocalParams({ ...localParams, availability: value as 'available' | 'busy' | 'unavailable' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Follower range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Followers</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={localParams.minFollowers || ''}
                    onChange={(e) => 
                      setLocalParams({ 
                        ...localParams, 
                        minFollowers: e.target.value ? Number(e.target.value) : undefined 
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Followers</Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={localParams.maxFollowers || ''}
                    onChange={(e) => 
                      setLocalParams({ 
                        ...localParams, 
                        maxFollowers: e.target.value ? Number(e.target.value) : undefined 
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <Button onClick={applyFilters}>Apply Filters</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {params.niche && (
            <Badge variant="secondary" className="gap-1">
              {NICHE_OPTIONS.find(n => n.value === params.niche)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onParamsChange({ niche: undefined })}
              />
            </Badge>
          )}
          {params.availability && (
            <Badge variant="secondary" className="gap-1">
              {AVAILABILITY_OPTIONS.find(a => a.value === params.availability)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onParamsChange({ availability: undefined })}
              />
            </Badge>
          )}
          {params.minFollowers && (
            <Badge variant="secondary" className="gap-1">
              Min: {params.minFollowers.toLocaleString()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onParamsChange({ minFollowers: undefined })}
              />
            </Badge>
          )}
          {params.maxFollowers && (
            <Badge variant="secondary" className="gap-1">
              Max: {params.maxFollowers.toLocaleString()}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onParamsChange({ maxFollowers: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
