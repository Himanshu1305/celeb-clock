// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DatePersonalityPage from '../DatePersonalityPage';

const renderPersonality = (month: string, day: number) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/born-on/${month}/${day}/personality`]}>
        <Routes><Route path="/born-on/:month/:day/personality" element={<DatePersonalityPage />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-PERS', () => {
  afterEach(() => cleanup());

  it('TC-PERS-P-01: August 6 renders', () => { renderPersonality('august', 6); expect(q('personality-page')).toBeTruthy(); });
  it('TC-PERS-P-02: August 6 shows Leo', () => { renderPersonality('august', 6); expect(document.body.textContent).toContain('Leo'); });
  it('TC-PERS-P-03: November 5 shows Scorpio or Virat', () => { renderPersonality('november', 5); expect(document.body.textContent).toMatch(/Scorpio|Virat/i); });
  it('TC-PERS-P-04: has CTA to birthday report', () => { renderPersonality('august', 6); const links = Array.from(document.querySelectorAll('a')).filter(a => a.getAttribute('href')?.includes('birthday-report')); expect(links.length).toBeGreaterThan(0); });
  it('TC-PERS-P-05: shows birth number', () => { renderPersonality('august', 6); expect(document.body.textContent || '').toMatch(/6|birth number/i); });
  it('TC-PERS-N-01: no undefined', () => { renderPersonality('august', 6); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-PERS-N-02: no [object Object]', () => { renderPersonality('august', 6); expect(document.body.textContent).not.toContain('[object Object]'); });
  it('TC-PERS-EDGE-01: Feb 29 no crash', () => expect(() => renderPersonality('february', 29)).not.toThrow());
  it('TC-PERS-EDGE-02: Jan 1 no crash', () => expect(() => renderPersonality('january', 1)).not.toThrow());
  it('TC-PERS-EDGE-03: Dec 31 no crash', () => expect(() => renderPersonality('december', 31)).not.toThrow());
});
