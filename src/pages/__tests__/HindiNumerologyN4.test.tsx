// @vitest-environment jsdom
/**
 * Audit N4 — Hindi numerology definitions.
 * Indian standard (Cheiro/Chaldean school): मूलांक = birth DAY reduced; भाग्यांक = the full
 * date (here the shared Life Path); 4 → Rahu, 7 → Ketu. Reference: round2.txt N4.
 * 28 Mar 1973: मूलांक 2+8 = 10 → 1; भाग्यांक 28→1, 3, 1973→20→2 → 6.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HindiNumerologyArticle } from '../articles/HindiNumerologyArticle';

afterEach(cleanup);
const renderPage = () => render(<HelmetProvider><MemoryRouter><HindiNumerologyArticle /></MemoryRouter></HelmetProvider>);

describe('Hindi numerology (N4)', () => {
  it('मूलांक is the birth day; भाग्यांक is the full date', () => {
    renderPage();
    const t = document.body.textContent || '';
    expect(t).toContain('मूलांक 1 होगा');
    expect(t).toContain('भाग्यांक 6');
    expect(t).not.toContain('2+8+0+3+1+9+7+3');
  });
  it('4 → Rahu and 7 → Ketu, never Uranus/Neptune', () => {
    renderPage();
    const t = document.body.textContent || '';
    expect(t).toContain('राहु (Rahu)');
    expect(t).toContain('केतु (Ketu)');
    expect(t).not.toMatch(/Uranus|Neptune/);
  });
});
