// Admin allowlist lives in src/lib/adminEmails.ts (single source of truth).
// This component just gates the /admin route on it.

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { isAdminEmail as isAdminEmailShared } from '@/lib/adminEmails';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAdminEmailShared(user?.email)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Re-exported for existing importers (e.g. Navigation).
export const isAdminEmail = (email: string | undefined) => isAdminEmailShared(email);
