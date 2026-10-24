// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import GlossaryPage from '../GlossaryPage';
import { VEDIC_TERMS, termSlug } from '@/lib/vedic/termDefinitions';

const renderAt = (path = '/glossary') => render(
  <HelmetProvider><MemoryRouter initialEntries={[path]}><GlossaryPage /></MemoryRouter></HelmetProvider>,
);
afterEach(() => cleanup());

describe('/glossary page', () => {
  it('renders every term with its own SEO anchor and Hindi name', () => {
    renderAt();
    expect(screen.getByTestId('glossary-page')).toBeTruthy();
    for (const id of Object.keys(VEDIC_TERMS)) {
      const el = document.getElementById(termSlug(id));
      expect(el, id).toBeTruthy();
      expect(el!.getAttribute('data-testid')).toBe(`glossary-term-${id}`);
    }
    expect(document.getElementById('rahu-kalam')!.textContent).toContain('राहु काल');
    expect(screen.getByTestId('glossary-count').textContent).toContain(String(Object.keys(VEDIC_TERMS).length));
  });

  it('has an A–Z jump bar and a DefinedTermSet JSON-LD', () => {
    renderAt();
    const az = screen.getByTestId('glossary-az');
    expect(az.querySelector('a[href="#letter-R"]')).toBeTruthy();
    const ld = document.querySelector('script[type="application/ld+json"]');
    expect(ld?.textContent).toContain('DefinedTermSet');
    expect(ld?.textContent).toContain('https://bornclock.com/glossary#rahu-kalam');
  });

  it('search filters by English, alias and Hindi', () => {
    renderAt();
    const box = screen.getByTestId('glossary-search');
    fireEvent.change(box, { target: { value: 'choghadiya' } });
    expect(document.getElementById('choghadiya')).toBeTruthy();
    expect(document.getElementById('lagna')).toBeNull();
    fireEvent.change(box, { target: { value: 'लग्न' } });
    expect(document.getElementById('lagna')).toBeTruthy();
    fireEvent.change(box, { target: { value: 'qqqqzz' } });
    expect(screen.getByTestId('glossary-results').textContent).toMatch(/No term matches/);
  });

  it('opening /glossary#term renders that anchor', () => {
    renderAt('/glossary#nadi-dosha');
    expect(document.getElementById('nadi-dosha')).toBeTruthy();
  });
});
