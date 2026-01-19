'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoading } from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('influencer' | 'brand')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, profile } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (!isLoading && isAuthenticated && profile && allowedRoles) {
      if (!allowedRoles.includes(profile.role)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, profile, allowedRoles, router]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
