'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DisplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100">
        {/* Display Portal Header will go here */}
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}