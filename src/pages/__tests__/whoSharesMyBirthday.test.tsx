// @vitest-environment jsdom
// Batch 11 (GSC): /celebrity-birthday/ is the one page for "who do i share a birthday with",
// "what famous person shares my birthday", "celebrities who share my birthday".
import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'fs';

vi.mock('@/services/BirthdaySearchService', () => ({
  getRankedBirthdayCelebrities: vi.fn(async () => [
    { name: 'Test Person', birthDate: '1990-10-30', occupation: 'Actor', knownFor: null, wikipediaUrl: null, nationality: null },
  ]),
}));
vi.mock('@/services/WikipediaImageService', () => ({ fetchCelebrityImage: vi.fn(async () => null) }));

import BirthdayCelebrityLanding from '../BirthdayCelebrityLanding';
import { getTitleForRoute } from '../../../scripts/prerender-titles.mjs';
import { faqVisibilityProblems } from '../../../scripts/lib/faqVisible.mjs';

afterEach(cleanup);

const renderPage = () => {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/celebrity-birthday/']}><BirthdayCelebrityLanding /></MemoryRouter>
    </HelmetProvider>,
  );
};

describe('/celebrity-birthday/ answers "who shares my birthday" first', () => {
  it('title, H1 and first paragraph use the query wording; prerender title matches', async () => {
    renderPage();
    await waitFor(() => expect(document.title).toContain('Who Shares My Birthday?'));
    expect(document.title).toBe('Who Shares My Birthday? Celebrities Born on Your Day | BornClock');
    expect(getTitleForRoute('/celebrity-birthday').title).toBe(document.title);
    const h1 = document.querySelector('h1')!;
    expect(h1.textContent).toBe('Who shares my birthday?');
    const lead = h1.closest('header, section, div')!.parentElement!.querySelector('p')!;
    expect(lead.textContent).toMatch(/Enter your birthday to see which famous people share it/);
  });

  it('the date picker comes before the results, and the results show today first', async () => {
    const { container } = renderPage();
    const form = container.querySelector('[data-testid="bc-hero-submit"]')!;
    const results = container.querySelector('#results')!;
    expect(form.compareDocumentPosition(results) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(results.textContent).toMatch(/Born today, /);
    await waitFor(() => expect(results.textContent).toContain('Test Person'));
  });

  it('FAQ is visible and in FAQPage JSON-LD, covering the query variants', async () => {
    const { container } = renderPage();
    await waitFor(() => expect(document.head.innerHTML + container.innerHTML).toContain('FAQPage'));
    const html = `<html><head>${document.head.innerHTML}</head><body>${container.innerHTML}</body></html>`;
    expect(faqVisibilityProblems(html)).toEqual([]);
    for (const q of ['Who shares my birthday?', 'What famous person shares my birthday?', 'How do I find celebrities who share my birthday?']) {
      expect(container.textContent).toContain(q);
    }
  });

  it('other birthday pages point here with the query as anchor text (no competing page)', () => {
    for (const f of ['src/pages/TodaysBirthdaysPage.tsx', 'src/pages/BirthdayHub.tsx', 'src/pages/Index.tsx', 'src/components/Navigation.tsx', 'src/components/Footer.tsx']) {
      const s = readFileSync(f, 'utf8');
      expect(s, f).toMatch(/celebrity-birthday\/[\s\S]{0,200}Who [Ss]hares [Mm]y [Bb]irthday\?|Who [Ss]hares [Mm]y [Bb]irthday\?[\s\S]{0,80}celebrity-birthday\//);
    }
  });
});
