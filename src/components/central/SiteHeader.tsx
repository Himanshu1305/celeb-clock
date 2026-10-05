import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';

/**
 * Central navy site header — the real site Navigation (brand + mobile menu) plus
 * the AuthNav sign-in/account group, on the `.paj .site-header` bar. Lifted
 * verbatim from the approved redesigned pages so the markup is byte-identical.
 */
export function SiteHeader() {
  return (
    <header className="site-header" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <Navigation />
      <AuthNav />
    </header>
  );
}
