// OWNER ACTION REQUIRED:
// Replace 'admin@bornclock.com' in ADMIN_EMAILS
// with your actual login email address.
// This controls who can access /admin.

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_EMAILS = [
  'hello@bornclock.com', // placeholder — owner must update
  'himanshu1305@gmail.com',// placeholder — owner must update
];

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const isAdminEmail = (email: string | undefined) =>
  ADMIN_EMAILS.includes(email || '');
