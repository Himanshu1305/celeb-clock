// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import KundliMilanByNamePage, { NAME_MATCH_META, NAME_MATCH_PATH } from '../KundliMilanByNamePage';
import HindiKundliMilanPage, { HINDI_MILAN_META, manglikLineHi } from '../hi/KundliMilanPage';
import { GunaMilanResultView } from '@/components/vedic/GunaMilanResultView';
import { GET } from '../../../api/kundali-match';
import { assessManglik } from '@/lib/vedic/manglik';

const { getTitleForRoute } = await import('../../../scripts/prerender-titles.mjs');
const { getAllRoutes } = await import('../../../scripts/prerender-routes.mjs');

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);
const wrap = (el: React.ReactNode, path: string) =>
  render(<HelmetProvider><MemoryRouter initialEntries={[path]}>{el}</MemoryRouter></HelmetProvider>);
const KOOTAS_HI = ['वर्ण', 'वश्य', 'तारा', 'योनि', 'ग्रह मैत्री', 'गण', 'भकूट', 'नाड़ी'];

afterEach(() => cleanup());

describe('titles: unique, ≤70 chars, prerender = live', () => {
  const pages: Array<[string, string]> = [
    [NAME_MATCH_PATH.en, NAME_MATCH_META.en.title],
    [NAME_MATCH_PATH.hi, NAME_MATCH_META.hi.title],
    ['/hi/kundli-milan', HINDI_MILAN_META.title],
  ];
  it.each(pages)('%s', async (route, title) => {
    expect(title.length).toBeLessThanOrEqual(70);
    expect((getTitleForRoute(route) as { title: string }).title).toBe(title);
    expect(await getAllRoutes()).toContain(route);
  });
  it('the three titles differ from each other and from /kundali-match', () => {
    const ts = [...pages.map(p => p[1]), (getTitleForRoute('/kundali-match') as { title: string }).title];
    expect(new Set(ts).size).toBe(4);
  });
  it('use the searched spellings', () => {
    expect(NAME_MATCH_META.en.title).toMatch(/^Kundli Milan by Name/);
    expect(NAME_MATCH_META.hi.title).toMatch(/^नाम से कुंडली मिलान/);
    expect(HINDI_MILAN_META.title).toMatch(/^कुंडली मिलान हिंदी में/);
  });
});

describe('/kundli-milan-by-name', () => {
  it('answer-first with the approximation warning linking to birth-detail matching', () => {
    wrap(<KundliMilanByNamePage lang="en" />, NAME_MATCH_PATH.en);
    expect(document.querySelector('h1')?.textContent).toBe('Kundli milan by name');
    const lim = q('nm-limit')!;
    expect(lim.textContent).toContain('Name-based matching is an approximation; for an accurate match use birth details.');
    expect(lim.querySelector('a')?.getAttribute('href')).toBe('/kundali-match/');
    expect(q('nm-faq')).toBeTruthy();
  });

  it('Dev × Radha: shows the two readings of "Dev" and scores the chosen one', () => {
    wrap(<KundliMilanByNamePage lang="en" />, NAME_MATCH_PATH.en);
    fireEvent.change(q('nm-name-boy')!, { target: { value: 'Dev' } });
    fireEvent.change(q('nm-name-girl')!, { target: { value: 'Radha' } });
    const choices = q('nm-choices-boy')!;
    expect(choices.textContent).toContain('Revati');
    expect(choices.textContent).toContain('Ashlesha');
    // Default = first reading (दे, Revati 1). Revati 1 × Chitra 3 = 12.5 (AstroSage P1×P2).
    expect(q('nm-total')?.textContent).toBe('12.5 / 36');
    expect(q('nm-manglik')?.textContent).toContain('cannot be checked from names');
  });

  it('a name with no table syllable offers the manual syllable list', () => {
    wrap(<KundliMilanByNamePage lang="en" />, NAME_MATCH_PATH.en);
    fireEvent.change(q('nm-name-boy')!, { target: { value: 'Aishwarya' } });
    expect(q('nm-none-boy')).toBeTruthy();
    expect((q('nm-pick-boy') as HTMLSelectElement).options.length).toBe(109);
  });
});

describe('/hi/naam-se-kundli-milan (Devanagari input)', () => {
  it('Hindi H1, Hindi warning, Devanagari names work and Hindi koota labels show', () => {
    wrap(<KundliMilanByNamePage lang="hi" />, NAME_MATCH_PATH.hi);
    expect(document.querySelector('h1')?.textContent).toBe('नाम से कुंडली मिलान');
    expect(q('nm-limit')!.textContent).toContain('नाम से मिलान केवल एक अनुमान है');
    expect(q('nm-limit')!.querySelector('a')?.getAttribute('href')).toBe('/hi/kundli-milan/');
    fireEvent.change(q('nm-name-boy')!, { target: { value: 'नूतन' } });
    fireEvent.change(q('nm-name-girl')!, { target: { value: 'राधा' } });
    expect(q('nm-reading-boy')?.textContent).toContain('अनुराधा');
    // Anuradha 3 × Chitra 3 = 7.5 (AstroSage Y3×P2).
    expect(q('nm-total')?.textContent).toBe('7.5 / 36');
    const table = q('nm-table')!.textContent!;
    for (const k of KOOTAS_HI) expect(table).toContain(k);
  });
});

describe('/hi/kundli-milan', () => {
  it('renders Hindi H1, explicit boy/girl boxes and the FAQ', () => {
    wrap(<HindiKundliMilanPage />, '/hi/kundli-milan');
    expect(document.querySelector('h1')?.textContent).toBe('कुंडली मिलान (गुण मिलान)');
    expect(document.body.textContent).toContain('लड़के का विवरण (वर)');
    expect(document.body.textContent).toContain('लड़की का विवरण (कन्या)');
    expect(q('hkm-faq')).toBeTruthy();
  });

  it('Hindi result for the real API answer (P1 boy × P2 girl = 12.5, AstroSage 17 Oct 2026)', async () => {
    const p = { yA: '1996', mA: '08', dA: '31', hA: '13', minA: '04', latA: '26.8467', lonA: '80.9462', tzidA: 'Asia/Kolkata',
      yB: '1999', mB: '12', dB: '03', hB: '11', minB: '03', latB: '42.6389', lonB: '-83.2910', tzidB: 'America/Detroit', groom: 'A' };
    const j: any = await (await GET(new Request('http://x/api/kundali-match?' + new URLSearchParams(p)))).json();
    wrap(<GunaMilanResultView result={j.gunaMilan} lang="hi" manglikStatus={j.manglik?.status} testid="hkm" />, '/hi/kundli-milan');
    expect(q('hkm-total')?.textContent).toBe('12.5 / 36');
    for (const k of KOOTAS_HI) expect(q('hkm-table')!.textContent).toContain(k);
    expect(q('hkm-total-note')?.textContent).toContain('पारंपरिक न्यूनतम 18 से कम');
  });

  it('Manglik lines show the Lagna and Moon checks separately, in Hindi', () => {
    // Lagna Aries, Moon Cancer, Mars Libra: 7th from Lagna (counts), 4th from Moon (counts) → High.
    const m = assessManglik({ lagnaSignIndex: 0, moonSignIndex: 3, marsSignIndex: 6 });
    const line = manglikLineHi('राम', m);
    expect(line).toContain('लग्न से मंगल 7वें भाव में (गिना जाता है)');
    expect(line).toContain('चंद्र से मंगल 4वें भाव में (गिना जाता है)');
    expect(line).toContain('मांगलिक (उच्च)');
  });
});
