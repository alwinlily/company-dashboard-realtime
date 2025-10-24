import { useAuth } from '@/contexts/auth-context';

export function useRequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return { user: null, isLoading: true };
  }

  if (!user) {
    throw new Error('Authentication required');
  }

  return { user, isLoading: false };
}

export function useRequireAdmin() {
  const { user, appUser, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return { user: null, appUser: null, isLoading: true, isAdmin: false };
  }

  if (!user) {
    throw new Error('Authentication required');
  }

  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  return { user, appUser, isLoading: false, isAdmin: true };
}

export function useAuthRedirect() {
  const { user, isLoading, isAdmin } = useAuth();

  return {
    user,
    isLoading,
    isAdmin,
    shouldRedirectToAdmin: !!user && isAdmin,
    shouldRedirectToDisplay: !!user && !isAdmin,
    shouldRedirectToLogin: !user && !isLoading,
  };
}