'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getCampaignsForUser,
  getCampaignById,
  updateCampaignStatus,
  updateCampaignProgress,
  getDeliverables,
  submitDeliverable,
  approveDeliverable,
  rejectDeliverable,
} from '@/services/campaign.service';
import type {
  CampaignWithDetails,
  CampaignFilterParams,
  CampaignStatus,
  Deliverable,
  PaginatedResponse,
} from '@/types';

export function useCampaigns(params: CampaignFilterParams = {}) {
  const { profile, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<PaginatedResponse<CampaignWithDetails> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filterParams, setFilterParams] = useState(params);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // No profile means user is not logged in
    if (!profile) {
      setIsLoading(false);
      return;
    }

    const fetchCampaigns = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getCampaignsForUser(profile.id, profile.role, filterParams);
        setData(result);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [authLoading, profile, filterParams]);

  const updateFilter = useCallback((newParams: Partial<CampaignFilterParams>) => {
    setFilterParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilterParams((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const result = await getCampaignsForUser(profile.id, profile.role, filterParams);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [profile, filterParams]);

  return {
    campaigns: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    updateFilter,
    setPage,
    refresh,
  };
}

export function useCampaign(id: string | null) {
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCampaign = useCallback(async () => {
    if (!id) {
      setCampaign(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getCampaignById(id);
      setCampaign(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return {
    campaign,
    isLoading,
    error,
    refresh: fetchCampaign,
  };
}

export function useCampaignActions(campaignId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateStatus = useCallback(async (status: CampaignStatus) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateCampaignStatus(campaignId, status);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  const updateProgress = useCallback(async (progress: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateCampaignProgress(campaignId, progress);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  return {
    updateStatus,
    updateProgress,
    isLoading,
    error,
  };
}

export function useDeliverables(campaignId: string) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDeliverables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getDeliverables(campaignId);
      setDeliverables(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const submit = useCallback(async (id: string, url: string, notes?: string) => {
    try {
      await submitDeliverable(id, url, notes);
      await fetchDeliverables();
    } catch (err) {
      throw err;
    }
  }, [fetchDeliverables]);

  const approve = useCallback(async (id: string) => {
    try {
      await approveDeliverable(id);
      await fetchDeliverables();
    } catch (err) {
      throw err;
    }
  }, [fetchDeliverables]);

  const reject = useCallback(async (id: string, reason: string) => {
    try {
      await rejectDeliverable(id, reason);
      await fetchDeliverables();
    } catch (err) {
      throw err;
    }
  }, [fetchDeliverables]);

  return {
    deliverables,
    isLoading,
    error,
    refresh: fetchDeliverables,
    submit,
    approve,
    reject,
  };
}
