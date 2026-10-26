// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import AccuracyPage from '../AccuracyPage';
import { EVIDENCE, ACCURACY_FAQ } from '@/lib/accuracy/evidence';

const renderPage = () => render(
  <HelmetProvider><MemoryRouter initialEntries={['/accuracy']}><AccuracyPage /></MemoryRouter></HelmetProvider>,
);
afterEach(() => cleanup());

describe('/accuracy page', () => {
  it('renders one H1 and a row per evidence item, each with a date', () => {
    renderPage();
    expect(screen.getByTestId('accuracy-page')).toBeTruthy();
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    for (const r of EVIDENCE) {
      const row = screen.getByTestId(`accuracy-row-${r.id}`);
      expect(row.textContent).toContain(r.result);
      expect(row.textContent).toContain(r.date);
    }
  });

  it('carries FAQPage JSON-LD that mirrors the visible questions', () => {
    renderPage();
    const ld = JSON.parse(screen.getByTestId('jsonld-accuracy-faq').innerHTML);
    expect(ld['@type']).toBe('FAQPage');
    expect(ld.mainEntity.map((q: { name: string }) => q.name)).toEqual(ACCURACY_FAQ.map(f => f.q));
    const visible = screen.getByTestId('accuracy-faq').textContent ?? '';
    for (const f of ACCURACY_FAQ) expect(visible).toContain(f.q);
  });

  it('states conventions, limits and the weekly check; no absolute claims', () => {
    renderPage();
    const text = document.body.textContent ?? '';
    for (const s of ['Lahiri', 'mean node', 'Parashari', 'AstroSage’s convention', 'up to about 2 minutes', 'both signs', 'Every Monday']) {
      expect(text, s).toContain(s);
    }
    expect(text).not.toMatch(/100\s*%|most accurate|better than/i);
    expect(text).toMatch(/In our tests \(October 2026\)/);
  });
});
