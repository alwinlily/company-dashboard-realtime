'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      if (requireAdmin && !isAdmin) {
        router.push('/display');
        return;
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, router]);

  if (isLoading) {
    return fallback || <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return fallback || null;
  }

  if (requireAdmin && !isAdmin) {
    return fallback || null;
  }

  return <>{children}</>;
}