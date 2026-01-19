'use client';

import { useState, useEffect, useCallback } from 'react';
import { getInfluencers, getInfluencerById } from '@/services/influencer.service';
import type { InfluencerWithProfile, InfluencerSearchParams, PaginatedResponse } from '@/types';

export function useInfluencers(initialParams: InfluencerSearchParams = {}) {
  const [data, setData] = useState<PaginatedResponse<InfluencerWithProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetchInfluencers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getInfluencers(params);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  const updateParams = useCallback((newParams: Partial<InfluencerSearchParams>) => {
    setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchInfluencers();
  }, [fetchInfluencers]);

  return {
    influencers: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    params,
    updateParams,
    setPage,
    refresh,
  };
}

export function useInfluencer(id: string | null) {
  const [influencer, setInfluencer] = useState<InfluencerWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInfluencer = useCallback(async () => {
    if (!id) {
      setInfluencer(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getInfluencerById(id);
      setInfluencer(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInfluencer();
  }, [fetchInfluencer]);

  return {
    influencer,
    isLoading,
    error,
    refresh: fetchInfluencer,
  };
}
