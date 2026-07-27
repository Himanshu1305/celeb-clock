import { ReactNode } from 'react';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';

/**
 * Standard chrome for /answers/* pages: the site header (logo + nav) and footer.
 * Previously these pages rendered only a breadcrumb, so they looked orphaned with
 * no way back into the site (founder report). Wraps the page body between the
 * shared Navigation and Footer.
 */
export function AnswerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation />
          <AuthNav />
        </div>
      </div>
      {children}
      <Footer />
    </div>
  );
}
