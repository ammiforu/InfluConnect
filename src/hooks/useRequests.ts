'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getRequestsForInfluencer,
  getRequestsForBrand,
  getRequestById,
  createRequest,
  updateRequestStatus,
  deleteRequest,
} from '@/services/request.service';
import type {
  CollaborationRequestWithDetails,
  CreateRequestFormData,
  RequestFilterParams,
  PaginatedResponse,
  RequestStatus,
} from '@/types';

export function useRequests(params: RequestFilterParams = {}) {
  const { profile, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<PaginatedResponse<CollaborationRequestWithDetails> | null>(null);
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

    const fetchRequests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = profile.role === 'influencer'
          ? await getRequestsForInfluencer(profile.id, filterParams)
          : await getRequestsForBrand(profile.id, filterParams);
        setData(result);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [authLoading, profile, filterParams]);

  const updateFilter = useCallback((newParams: Partial<RequestFilterParams>) => {
    setFilterParams((prev) => ({ ...prev, ...newParams, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilterParams((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
    try {
      const result = profile.role === 'influencer'
        ? await getRequestsForInfluencer(profile.id, filterParams)
        : await getRequestsForBrand(profile.id, filterParams);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [profile, filterParams]);

  return {
    requests: data?.data || [],
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

export function useRequest(id: string | null) {
  const [request, setRequest] = useState<CollaborationRequestWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequest = useCallback(async () => {
    if (!id) {
      setRequest(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getRequestById(id);
      setRequest(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  return {
    request,
    isLoading,
    error,
    refresh: fetchRequest,
  };
}

export function useRequestActions() {
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = useCallback(async (data: CreateRequestFormData) => {
    if (!profile || profile.role !== 'brand') {
      throw new Error('Only brands can create requests');
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await createRequest(profile.id, data);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const accept = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateRequestStatus(id, 'accepted');
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reject = useCallback(async (id: string, reason?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateRequestStatus(id, 'rejected', reason);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteRequest(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    create,
    accept,
    reject,
    cancel,
    isLoading,
    error,
  };
}
