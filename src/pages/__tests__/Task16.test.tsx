// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import RashifalPage from '../hi/RashifalPage';

const renderRashifal = (rashi: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/hi/rashifal/${rashi}`]}>
        <Routes><Route path="/hi/rashifal/:rashi" element={<RashifalPage />} /></Routes>
      </MemoryRouter>
    </HelmetProvider>
  );
const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-RASHIFAL', () => {
  afterEach(() => cleanup());

  it('TC-RASHIFAL-P-01: vrischika renders', () => { renderRashifal('vrischika'); expect(q('rashifal-page')).toBeTruthy(); });
  it('TC-RASHIFAL-P-02: vrischika contains वृश्चिक', () => { renderRashifal('vrischika'); expect(document.body.textContent).toContain('वृश्चिक'); });
  it('TC-RASHIFAL-P-03: page has Devanagari content', () => { renderRashifal('vrischika'); expect(document.body.textContent).toMatch(/[ऀ-ॿ]/); });
  it('TC-RASHIFAL-P-04: all 12 Rashi routes defined', () => {
    ['mesha', 'vrisha', 'mithuna', 'karka', 'simha', 'kanya', 'tula', 'vrischika', 'dhanu', 'makara', 'kumbha', 'meena']
      .forEach(r => { expect(() => renderRashifal(r)).not.toThrow(); cleanup(); });
  });
  it('TC-RASHIFAL-P-05: mesha and meena have different H1', () => {
    renderRashifal('mesha'); const h1a = document.querySelector('h1')?.textContent; cleanup();
    renderRashifal('meena'); const h1b = document.querySelector('h1')?.textContent;
    expect(h1a).not.toBe(h1b);
  });
  it('TC-RASHIFAL-N-01: no undefined in Hindi pages', () => { renderRashifal('vrischika'); expect(document.body.textContent).not.toContain('undefined'); });
  it('TC-RASHIFAL-N-02: wrong Rashi URL no crash', () => expect(() => renderRashifal('notarashi')).not.toThrow());
  it('TC-RASHIFAL-EDGE-01: mesha and meena both render', () => { expect(() => renderRashifal('mesha')).not.toThrow(); cleanup(); expect(() => renderRashifal('meena')).not.toThrow(); });
});
