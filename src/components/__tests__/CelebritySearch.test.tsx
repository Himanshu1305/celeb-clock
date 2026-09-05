// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { readFileSync } from 'fs';

// ── Mock the Supabase client so runSearch resolves synchronously with fixtures.
const mockRows: any[] = [];
vi.mock('@/integrations/supabase/client', () => {
  const builder: any = {
    select: () => builder,
    ilike: () => builder,
    not: () => builder,
    order: () => builder,
    or: () => builder,
    limit: () => Promise.resolve({ data: mockRows, error: null }),
  };
  return { supabase: { from: () => builder } };
});

import { CelebritySearch } from '@/components/CelebritySearch';

const setRows = (rows: any[]) => {
  mockRows.length = 0;
  mockRows.push(...rows);
};

const renderSearch = () =>
  render(
    <MemoryRouter>
      <CelebritySearch />
    </MemoryRouter>
  );

describe('CelebritySearch CTA — TC-CELFIX', () => {
  beforeEach(() => setRows([]));
  afterEach(() => cleanup());

  it('TC-CELFIX-P-01: results render a "View Birthday Profile" CTA', async () => {
    setRows([{ name: 'Virat Kohli', birth_date: '1988-11-05', nationality_code: 'IN', sitelinks: 100 }]);
    const { container } = renderSearch();
    const input = container.querySelector('input') as HTMLInputElement;
    input.focus();
    // Trigger search via the exposed input
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { value: 'Virat' } });
    await waitFor(() => expect(screen.getByText(/View Birthday Profile/i)).toBeTruthy(), { timeout: 2000 });
  });

  it('TC-CELFIX-P-02: CTA href points to /birthday-report?dob=', async () => {
    setRows([{ name: 'Zendaya', birth_date: '1996-09-01', nationality_code: 'US', sitelinks: 90 }]);
    const { container } = renderSearch();
    const input = container.querySelector('input') as HTMLInputElement;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { value: 'Zendaya' } });
    await waitFor(() => {
      const link = container.querySelector('a[href*="birthday-report"]') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link.getAttribute('href')).toContain('/birthday-report?dob=1996-09-01');
    }, { timeout: 2000 });
  });

  it('TC-CELFIX-P-03: no /?dob= pattern in any CTA href', async () => {
    setRows([{ name: 'A.R. Rahman', birth_date: '1967-01-06', nationality_code: 'IN', sitelinks: 80 }]);
    const { container } = renderSearch();
    const input = container.querySelector('input') as HTMLInputElement;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { value: 'Rahman' } });
    await waitFor(() => expect(container.querySelectorAll('a').length).toBeGreaterThan(0), { timeout: 2000 });
    container.querySelectorAll('a').forEach((l) => {
      expect(l.getAttribute('href') || '').not.toMatch(/^\/\?dob=/);
    });
  });

  it('TC-CELFIX-N-01: source no longer contains legacy /?dob= CTA', () => {
    const src = readFileSync('src/components/CelebritySearch.tsx', 'utf8');
    expect(src).not.toContain('to={`/?dob=');
    expect(src).toContain('/birthday-report?dob=');
  });

  it('TC-CELFIX-EDGE-01: empty result set → no crash, no CTA', async () => {
    setRows([]);
    const { container } = renderSearch();
    const input = container.querySelector('input') as HTMLInputElement;
    const { fireEvent } = await import('@testing-library/react');
    fireEvent.change(input, { target: { value: 'zzzznobody' } });
    await new Promise((r) => setTimeout(r, 600));
    expect(container.querySelector('a[href*="birthday-report"]')).toBeFalsy();
  });
});

describe('celebrity-birthday redirect — TC-CELFIX', () => {
  it('TC-CELFIX-P-04: App.tsx redirects /celebrity-birthday to /celebrity/', () => {
    const app = readFileSync('src/App.tsx', 'utf8');
    expect(app).toMatch(/path="\/celebrity-birthday"\s+element=\{<Navigate to="\/celebrity\/" replace \/>\}/);
  });
});

describe('born-on year picker — TC-CELFIX', () => {
  it('TC-CELFIX-P-05: BornOnIndex has a year select spanning 1920→current', () => {
    const src = readFileSync('src/pages/BornOnIndex.tsx', 'utf8');
    expect(src).toContain('data-testid="bornon-year-select"');
    expect(src).toContain('1920');
  });
});
