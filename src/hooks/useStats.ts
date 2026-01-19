'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getInfluencerStats, getBrandStats } from '@/services/stats.service';
import type { UserStats } from '@/types';

export function useStats() {
  const { profile, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // No profile means user is not logged in or profile not found
    if (!profile) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = profile.role === 'influencer'
          ? await getInfluencerStats(profile.id)
          : await getBrandStats(profile.id);
        setStats(result);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [authLoading, profile]);

  const refresh = useCallback(async () => {
    if (!profile) return;
    setIsLoading(true);
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

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
}
