// @vitest-environment jsdom
/**
 * Batch 7 (W8): /baby-names/nakshatra/:slug pages, the Kundali name-letter link and the
 * US state life-expectancy figures.
 * References: syllables — Drik Panchang 108-pada table (nakshatraAksharas.ts); deity and
 * name meaning — Wikipedia "Nakshatra" table (opened via WebFetch); names — every entry's
 * own source URL (babyNamesByAkshara.ts; batch 8 re-sourced the whole list);
 * US states — CDC/NCHS "U.S. State Life Tables, 2022", NVSR 74-12 (opened via WebFetch).
 */
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BabyNamesNakshatraPage, { babyNamesTitle, babyNamesDescription, padaRashi } from '../BabyNamesNakshatraPage';
import BabyNamesPage from '../BabyNamesPage';
import LifeExpectancyUSA from '../LifeExpectancyUSA';
import { NakshatraNameLetters } from '@/components/vedic/NakshatraNameLetters';
import { NAKSHATRA_ORDER, NAKSHATRA_EXTRA, NAKSHATRA_SLUGS } from '@/data/nakshatraPages';
import { NAKSHATRA_NAME_FACTS } from '@/data/nakshatraNameFacts';
import { namesForPada, padasForName, BABY_NAMES } from '@/data/babyNamesByAkshara';
import { US_STATE_LE_HIGHEST, US_STATE_LE_LOWEST } from '@/data/usStateLifeExpectancy';
import { getTitleForRoute } from '../../../scripts/prerender-titles.mjs';

const { getAllRoutes } = await import('../../../scripts/prerender-routes.mjs');
const routes: string[] = await getAllRoutes();

afterEach(cleanup);

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/baby-names" element={<BabyNamesPage />} />
          <Route path="/baby-names/nakshatra/:slug" element={<BabyNamesNakshatraPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('baby names by nakshatra — 27 pages', () => {
  it('all 27 routes are in the prerender/sitemap list, once each', () => {
    const bn = routes.filter(r => r.startsWith('/baby-names/nakshatra/'));
    expect(bn).toHaveLength(27);
    expect(bn.sort()).toEqual(NAKSHATRA_SLUGS.map(s => `/baby-names/nakshatra/${s}`).sort());
  });

  it('prerender title/description match the page, and are unique (also vs /nakshatra/:slug)', () => {
    const titles = new Set<string>();
    for (const n of NAKSHATRA_ORDER) {
      const slug = NAKSHATRA_EXTRA[n].slug;
      const meta = getTitleForRoute(`/baby-names/nakshatra/${slug}`);
      expect(meta.title).toBe(babyNamesTitle(n));
      expect(meta.description).toBe(babyNamesDescription(n));
      titles.add(meta.title);
      titles.add(getTitleForRoute(`/nakshatra/${slug}`).title);
    }
    expect(titles.size).toBe(54);
    expect(getTitleForRoute('/baby-names/nakshatra/not-a-star')).toBeNull();
  });

  it('every nakshatra has a sourced deity and name meaning', () => {
    for (const n of NAKSHATRA_ORDER) {
      expect(NAKSHATRA_NAME_FACTS[n]?.deity).toBeTruthy();
      expect(NAKSHATRA_NAME_FACTS[n]?.nameMeaning).toBeTruthy();
    }
    // Spot values from the Wikipedia table.
    expect(NAKSHATRA_NAME_FACTS.Rohini).toMatchObject({ deity: 'Prajapati', nameMeaning: 'the radiant maiden' });
    expect(NAKSHATRA_NAME_FACTS.Revati).toMatchObject({ deity: 'Pushan', nameMeaning: 'prosperous' });
    expect(NAKSHATRA_NAME_FACTS.Shatabhisha.nameMeaning).toBe('a hundred physicians');
  });

  it('pada Moon signs are computed correctly (9 padas per sign)', () => {
    expect(padaRashi(0, 1).sanskrit).toBe('Mesha');            // Ashwini 1
    expect(padaRashi(2, 1).sanskrit).toBe('Mesha');            // Krittika 1 (Aries)
    expect(padaRashi(2, 2).sanskrit).toBe('Vrishabha');        // Krittika 2-4 (Taurus)
    expect(padaRashi(4, 2).sanskrit).toBe('Vrishabha');        // Mrigashira 1-2 Taurus
    expect(padaRashi(4, 3).sanskrit).toBe('Mithuna');          // Mrigashira 3-4 Gemini
    expect(padaRashi(26, 4).sanskrit).toBe('Meena');           // Revati 4
  });

  it('Rohini page: H1, four padas with syllables, deity, names, canonical', () => {
    const { getByRole, getAllByTestId, getByTestId } = renderPath('/baby-names/nakshatra/rohini');
    expect(getByRole('heading', { level: 1 }).textContent).toBe('Rohini Nakshatra Baby Names');
    const padas = getAllByTestId('bnn-pada');
    expect(padas).toHaveLength(4);
    expect(padas[0].textContent).toContain('“O”');
    expect(padas[0].textContent).toContain('Om');
    expect(padas[3].textContent).toContain('“Vu”');
    expect(getByTestId('bnn-facts').textContent).toContain('Prajapati');
    expect(getByTestId('bnn-facts').textContent).toContain('the radiant maiden');
    expect(document.body.textContent).not.toMatch(/noindex/i);
  });

  it('every page renders and lists exactly the names that match its syllables', () => {
    for (const n of NAKSHATRA_ORDER) {
      const { getAllByTestId, getByTestId } = renderPath(`/baby-names/nakshatra/${NAKSHATRA_EXTRA[n].slug}`);
      expect(getAllByTestId('bnn-pada')).toHaveLength(4);
      const expected = [1, 2, 3, 4].reduce((s, p) => s + namesForPada(n, p).length, 0);
      expect(getByTestId('bnn-count').textContent).toContain(`${expected} name`);
      cleanup();
    }
  }, 30000);

  it('the hub /baby-names links to all 27 pages', () => {
    const { getByTestId } = renderPath('/baby-names');
    expect(getByTestId('baby-nakshatra-links').querySelectorAll('a')).toHaveLength(27);
  });

  it('every listed name shows its Source link (batch 8)', () => {
    for (const n of NAKSHATRA_ORDER) {
      const expected = [1, 2, 3, 4].flatMap(p => namesForPada(n, p));
      renderPath(`/baby-names/nakshatra/${NAKSHATRA_EXTRA[n].slug}`);
      const links = Array.from(document.querySelectorAll('a[data-testid="bn-source"]'));
      expect(links.map(a => a.getAttribute('href'))).toEqual(expected.map(x => x.source));
      for (const a of links) {
        expect(a.textContent).toBe('Source');
        expect(a.getAttribute('rel')).toContain('noopener');
      }
      cleanup();
    }
  }, 30000);

  it('a pada with no checked names says so plainly', () => {
    const { getAllByTestId } = renderPath('/baby-names/nakshatra/ashlesha');
    for (const p of getAllByTestId('bnn-pada')) expect(p.textContent).toContain('no names for this sound yet');
  });

  it('the three sourced additions land in the right pada', () => {
    const find = (x: string) => BABY_NAMES.find(b => b.name === x)!;
    expect(padasForName(find('Chetan'))).toEqual([{ nakshatra: 'Ashwini', pada: 2 }]);
    expect(padasForName(find('Chetana'))).toEqual([{ nakshatra: 'Ashwini', pada: 2 }]);
    expect(padasForName(find('Bholanath'))).toEqual([{ nakshatra: 'Uttara Ashadha', pada: 2 }]);
  });
});

describe('Kundali result → name letters link', () => {
  it('with a pada: one syllable and the link', () => {
    const { getByTestId } = render(<MemoryRouter><NakshatraNameLetters nakshatra="Rohini" pada={4} /></MemoryRouter>);
    const el = getByTestId('kundali-name-letters');
    expect(el.textContent).toContain('“Vu”');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/baby-names/nakshatra/rohini');
  });
  it('without a pada: all four syllables', () => {
    const { getByTestId } = render(<MemoryRouter><NakshatraNameLetters nakshatra="Purva Phalguni" pada={undefined} /></MemoryRouter>);
    expect(getByTestId('kundali-name-letters').textContent).toContain('Mo, Ta, Ti, Tu');
  });
  it('unknown nakshatra renders nothing', () => {
    const { container } = render(<MemoryRouter><NakshatraNameLetters nakshatra="—" pada={1} /></MemoryRouter>);
    expect(container.textContent).toBe('');
  });
});

describe('US state life expectancy (CDC/NCHS State Life Tables, 2022)', () => {
  it('data matches NVSR 74-12', () => {
    expect(US_STATE_LE_HIGHEST[0]).toEqual(['Hawaii', 80.0]);
    expect(US_STATE_LE_LOWEST[0]).toEqual(['West Virginia', 72.2]);
    expect(US_STATE_LE_LOWEST[1]).toEqual(['Mississippi', 72.6]);
  });
  it('page shows the corrected figures with source and year, not the old ones', () => {
    render(<HelmetProvider><MemoryRouter><LifeExpectancyUSA /></MemoryRouter></HelmetProvider>);
    const t = document.body.textContent || '';
    expect(t).toContain('80.0');
    expect(t).toContain('West Virginia');
    expect(t).toContain('72.2');
    expect(t).toContain('U.S. State Life Tables, 2022');
    expect(t).toContain('7.8-year gap');
    expect(t).not.toMatch(/roughly 81 years|about 71|approximately 81 years|around 71 years|10-year gap/);
    expect(document.querySelector('a[href="https://www.cdc.gov/nchs/data/nvsr/nvsr74/nvsr74-12.pdf"]')).toBeTruthy();
  });
});
