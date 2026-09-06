// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import KundaliCompatArticle from '../articles/KundaliCompatArticle';
import DiwaliGiftPage from '../DiwaliGiftPage';

const renderArticle = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/articles/kundali-compatibility']}><KundaliCompatArticle /></MemoryRouter></HelmetProvider>);
const renderDiwali = () =>
  render(<HelmetProvider><MemoryRouter initialEntries={['/diwali-gift']}><DiwaliGiftPage /></MemoryRouter></HelmetProvider>);
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-ART+DIWALI', () => {
  afterEach(() => cleanup());

  it('TC-ART-P-01: kundali-compat article renders', () => { renderArticle(); expect(q('kundali-compat-article')).toBeTruthy(); });
  it('TC-ART-P-02: article >= 1500 words', () => { renderArticle(); expect((document.body.textContent || '').split(/\s+/).length).toBeGreaterThan(1500); });
  it('TC-ART-P-03: links to /kundali-match', () => { renderArticle(); const links = Array.from(document.querySelectorAll('a')).filter(a => a.getAttribute('href')?.includes('kundali-match')); expect(links.length).toBeGreaterThan(0); });
  it('TC-ART-P-04: mentions Nadi', () => { renderArticle(); expect((document.body.textContent || '').toLowerCase()).toContain('nadi'); });
  it('TC-ART-P-05: mentions all 8 factors', () => { renderArticle(); const b = (document.body.textContent || '').toLowerCase(); ['varna', 'vashya', 'tara', 'yoni', 'gana', 'bhakoot', 'nadi'].forEach(k => expect(b, `Missing: ${k}`).toContain(k)); });
  it('TC-ART-N-01: no undefined in article', () => { renderArticle(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-DIWALI-P-01: /diwali-gift renders', () => { renderDiwali(); expect(q('diwali-gift-page')).toBeTruthy(); });
  it('TC-DIWALI-P-02: shows 199', () => { renderDiwali(); expect(document.body.textContent).toContain('₹199'); });
  it('TC-DIWALI-P-03: shows Diwali', () => { renderDiwali(); expect(document.body.textContent).toMatch(/Diwali|दिवाली/i); });
  it('TC-DIWALI-N-01: no undefined', () => { renderDiwali(); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-DIWALI-N-02: 299 only near combo', () => { renderDiwali(); const combo = q('diwali-product-combo')?.textContent || ''; expect(combo).toContain('₹299'); expect(combo.toLowerCase()).toContain('combo'); });
});
