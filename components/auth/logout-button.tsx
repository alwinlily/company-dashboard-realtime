'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function LogoutButton({ variant = 'ghost' }: { variant?: 'ghost' | 'default' | 'destructive' }) {
  const { signOut, user, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    // Router will handle redirect via middleware
  };

  if (!user || isLoading) {
    return null;
  }

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2"
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  );
}