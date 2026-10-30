// @vitest-environment jsdom
// Batch 7 (W6): every angel-number page renders one H1, the answer-first block, the
// numerology section, FAQ JSON-LD and a link to the numerology calculator.
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AngelNumberPage from '../AngelNumberPage';
import AngelNumbersPage from '../AngelNumbersPage';
import { ANGEL_SEQUENCES } from '@/data/angelNumbers';

afterEach(cleanup);

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/angel-numbers" element={<AngelNumbersPage />} />
          <Route path="/angel-numbers/:number" element={<AngelNumberPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('angel number pages', () => {
  for (const seq of ANGEL_SEQUENCES) {
    it(`${seq}: one H1, answer first, FAQ JSON-LD, numerology + calculator link`, () => {
      renderAt(`/angel-numbers/${seq}`);
      const h1s = document.querySelectorAll('h1');
      expect(h1s.length).toBe(1);
      expect(h1s[0].textContent).toBe(`Angel Number ${seq} Meaning`);
      expect(document.querySelector('main')).toBeTruthy();
      expect(document.querySelector('[data-testid="angel-answer"]')?.textContent).toContain(seq);
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => JSON.parse(s.textContent || '{}'))
        .find(j => j['@type'] === 'FAQPage');
      expect(ld).toBeTruthy();
      expect(ld.mainEntity.length).toBe(6);
      expect(ld.mainEntity[0].name).toBe(`What does angel number ${seq} mean?`);
      expect(document.querySelector('[data-testid="angel-numerology"]')).toBeTruthy();
      expect(document.querySelector('a[href="/numerology/"]')).toBeTruthy();
      expect(document.querySelector('a[href="/angel-numbers/"]')).toBeTruthy();
    });
  }

  it('Life Path checker uses the shared method (15 Aug 1990 → 6, matches 222)', () => {
    renderAt('/angel-numbers/222');
    fireEvent.change(document.getElementById('angel-dob')!, { target: { value: '1990-08-15' } });
    const r = document.querySelector('[data-testid="angel-lifepath-result"]')!.textContent!;
    expect(r).toMatch(/Life Path number.* is 6 \(Day 15/);
    expect(r).toContain('also reduce to 6');
  });

  it('unknown number shows a not-found page that links to the real ones', () => {
    renderAt('/angel-numbers/123');
    expect(document.querySelector('h1')?.textContent).toMatch(/not found/i);
    expect(document.querySelector('a[href="/angel-numbers/111/"]')).toBeTruthy();
  });

  it('hub links every number page and keeps the old #a111 anchors', () => {
    renderAt('/angel-numbers');
    for (const seq of ANGEL_SEQUENCES) {
      const a = document.getElementById(`a${seq}`);
      expect(a?.getAttribute('href')).toBe(`/angel-numbers/${seq}/`);
    }
  });
});
