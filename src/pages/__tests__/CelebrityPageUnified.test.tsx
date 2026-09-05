// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { readFileSync } from 'fs';
import { CelebrityPage } from '../CelebrityPage';
import data from '@/data/celebrities.json';

const renderCelebPage = (slug: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/celebrity/${slug}`]}>
        <Routes>
          <Route path="/celebrity/:slug" element={<CelebrityPage />} />
          <Route path="/celebrity/" element={<div data-testid="celeb-index">Index</div>} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('Celebrity DB Unification — TC-UDB', () => {
  afterEach(() => cleanup());

  it('TC-UDB-P-01: celebrities.json has > 2000 entries', () => {
    expect(data.total).toBeGreaterThan(2000);
  });
  it('TC-UDB-P-02: no duplicate slugs', () => {
    const slugs = data.celebrities.map((c: any) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it('TC-UDB-P-03: Virat Kohli slug preserved', () => {
    const v = data.celebrities.find((c: any) => c.name === 'Virat Kohli');
    expect(v?.slug).toBe('virat-kohli');
  });
  it('TC-UDB-P-04: Prabhupada in celebrities', () => {
    const p = data.celebrities.find((c: any) => c.name.includes('Prabhupada'));
    expect(p?.slug).toBeTruthy();
  });

  it('TC-UDB-D-01: CelebrityPage renders Virat Kohli without broken markers', () => {
    renderCelebPage('virat-kohli');
    expect(document.body.textContent).toContain('Virat Kohli');
    expect(document.body.textContent).not.toContain('[object Object]');
  });
  it('TC-UDB-D-02: CelebrityPage renders a Supabase-sourced (db) celebrity', () => {
    const dbCeleb = data.celebrities.find((c: any) => c.source === 'db' && c.slug);
    expect(dbCeleb).toBeTruthy();
    expect(() => renderCelebPage(dbCeleb!.slug)).not.toThrow();
  });

  it('TC-UDB-N-01: CelebrityPage sources the unified celebrities.json, not indianCelebrities', () => {
    const src = readFileSync('src/pages/CelebrityPage.tsx', 'utf8');
    expect(src).toContain("from '@/data/celebrities.json'");
    expect(src).not.toContain("from '@/data/indianCelebrities'");
  });
  it('TC-UDB-N-02: blocked IDs not in export', () => {
    const ids = data.celebrities.map((c: any) => c.id);
    [3503, 3522, 3567, 3690].forEach(id => expect(ids).not.toContain(id));
  });

  it('TC-UDB-EDGE-01: a year-only celebrity (no birth_month_day) renders without throwing', () => {
    const yearOnly = data.celebrities.find((c: any) => !c.birth_month_day && c.slug);
    if (!yearOnly) return;
    expect(() => renderCelebPage(yearOnly.slug)).not.toThrow();
  });
});
