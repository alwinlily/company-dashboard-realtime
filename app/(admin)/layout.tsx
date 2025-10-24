'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Navigation Header will go here */}
        <main>{children}</main>
        <Toaster />
      </div>
    </ProtectedRoute>
  );
}