'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInfluencerStats, getBrandStats } from '@/services/stats.service';
import type { UserStats } from '@/types';

export function useStats() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = profile.role === 'influencer'
        ? await getInfluencerStats(profile.id)
        : await getBrandStats(profile.id);
      setStats(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refresh: fetchStats,
  };
}
