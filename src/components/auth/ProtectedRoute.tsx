'use client';

import { useEffect, useState } from 'react';
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/login');
    }

    if (!isLoading && isAuthenticated && profile && allowedRoles) {
      if (!allowedRoles.includes(profile.role)) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, profile, allowedRoles, router, isRedirecting]);

  if (isLoading || isRedirecting) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return <PageLoading />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
