import { describe, it, expect } from 'vitest';
import {
  normalizeCelebName, dedupeCelebrities, mergeCelebrityRecords, recordRetiredSlugs, CELEBRITY_ALIASES,
} from '../celebrityDedupe';
import { duplicateRedirect, celebritySlugRedirect } from '../seo/duplicateRedirects';
import celebritiesData from '../../data/celebrities.json';
import redirects from '../../data/celebritySlugRedirects.json';
import { INDIAN_CELEBRITIES } from '../../data/indianCelebrities';
import { generateAllSlugs } from '../../utils/celebrityUtils';
import celebMeta from '../../../scripts/celebrity-meta.json';

type C = Record<string, unknown>;
const celebs = (celebritiesData as { celebrities: C[] }).celebrities;
const RED = redirects as Record<string, string>;

describe('normalizeCelebName', () => {
  it('ignores case, accents, dots, spaces and hyphens', () => {
    expect(normalizeCelebName('A. P. J. Abdul Kalam')).toBe(normalizeCelebName('APJ Abdul Kalam'));
    expect(normalizeCelebName('Rekhā')).toBe('rekha');
    expect(normalizeCelebName('Jr NTR')).toBe('jrntr');
  });
});

describe('dedupeCelebrities', () => {
  it('same name + same birth date → one record, first slug kept, later slug retired', () => {
    const r = dedupeCelebrities([
      { name: 'Virat Kohli', slug: 'virat-kohli', birth_date: '1988-11-05', known_for: 'x' },
      { name: 'Virat Kohli', slug: 'virat-kohli-1988', birth_date: '1988-11-05', known_for: 'x' },
    ]);
    expect(r.list.map(c => c.slug)).toEqual(['virat-kohli']);
    expect(r.retired).toEqual({ 'virat-kohli-1988': 'virat-kohli' });
  });

  it('same name, DIFFERENT birth date → two people, both kept', () => {
    const r = dedupeCelebrities([
      { name: 'Vijay', slug: 'vijay', birth_date: '1974-06-22' },
      { name: 'Vijay', slug: 'vijay-1960', birth_date: '1960-01-01' },
    ]);
    expect(r.list).toHaveLength(2);
    expect(r.retired).toEqual({});
  });

  it('checked alias with the same birth date merges; DB fields fill the kept record', () => {
    const r = dedupeCelebrities([
      { name: 'Bhimrao Ambedkar', slug: 'bhimrao-ambedkar', birth_date: '1891-04-14', death_date: '1956-12-06', source: 'static' },
      { id: 3827, name: 'Bhimrao Ramji Ambedkar', slug: 'bhimrao-ramji-ambedkar', birth_date: '1891-04-14', sitelinks: 147, occupation: 'jurist', source: 'db' },
    ]);
    expect(r.list).toHaveLength(1);
    expect(r.list[0]).toMatchObject({ slug: 'bhimrao-ambedkar', id: 3827, sitelinks: 147, occupation: 'jurist', source: 'static' });
    expect(r.merges).toEqual([{ kept: 'bhimrao-ambedkar', retired: 'bhimrao-ramji-ambedkar', reason: 'alias' }]);
  });

  it('alias seen BEFORE its target still merges into the target', () => {
    const r = dedupeCelebrities([
      { name: 'Sadhguru', slug: 'sadhguru', birth_date: '1957-09-03', sitelinks: 50 },
      { name: 'Sadhguru Jaggi Vasudev', slug: 'sadhguru-jaggi-vasudev', birth_date: '1957-09-03' },
    ]);
    expect(r.list.map(c => c.slug)).toEqual(['sadhguru-jaggi-vasudev']);
    expect(r.list[0].sitelinks).toBe(50);
    expect(r.retired).toEqual({ sadhguru: 'sadhguru-jaggi-vasudev' });
  });

  it('alias with a different birth date is NOT merged (conservative)', () => {
    const r = dedupeCelebrities([
      { name: 'Bhimrao Ambedkar', slug: 'bhimrao-ambedkar', birth_date: '1891-04-14' },
      { name: 'Bhimrao Ramji Ambedkar', slug: 'bhimrao-ramji-ambedkar', birth_date: '1900-01-01' },
    ]);
    expect(r.list).toHaveLength(2);
  });

  it('different people born the same day are never merged (Sonu Nigam / Sonu Sood, 1973-07-30)', () => {
    expect(CELEBRITY_ALIASES['sonu-sood']).toBeUndefined();
    const r = dedupeCelebrities([
      { name: 'Sonu Nigam', slug: 'sonu-nigam', birth_date: '1973-07-30' },
      { name: 'Sonu Sood', slug: 'sonu-sood', birth_date: '1973-07-30' },
    ]);
    expect(r.list).toHaveLength(2);
  });

  it('a real death date replaces a YYYY-01-01 placeholder of the same year, never a different year', () => {
    expect(mergeCelebrityRecords({ death_date: '1975-01-01' }, { death_date: '1975-10-31' }).death_date).toBe('1975-10-31');
    expect(mergeCelebrityRecords({ death_date: '1975-10-31' }, { death_date: '1975-01-01' }).death_date).toBe('1975-10-31');
    expect(mergeCelebrityRecords({ death_date: '1975-01-01' }, { death_date: '1980-05-05' }).death_date).toBe('1975-01-01');
  });

  it('recordRetiredSlugs is append-only, collapses chains and never redirects a live slug', () => {
    const live = new Set(['c', 'x']);
    expect(recordRetiredSlugs({ a: 'b' }, { b: 'c' }, live)).toEqual({ a: 'c', b: 'c' });
    expect(recordRetiredSlugs({ x: 'c' }, {}, live)).toEqual({});
    expect(recordRetiredSlugs({ gone: 'nowhere' }, {}, live)).toEqual({});
  });
});

describe('current data: one page per person', () => {
  it('celebrities.json has no two records with the same normalised name + birth date', () => {
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const c of celebs) {
      if (!c.birth_date) continue;
      const k = `${normalizeCelebName(String(c.name))}|${c.birth_date}`;
      if (seen.has(k)) dups.push(`${seen.get(k)} / ${c.slug}`);
      else seen.set(k, String(c.slug));
    }
    expect(dups).toEqual([]);
  });

  it('dedupe is a no-op on the committed file (export already applied it)', () => {
    expect(dedupeCelebrities(celebs).merges).toEqual([]);
  });

  it('no alias source slug is still a page', () => {
    const slugs = new Set(celebs.map(c => String(c.slug)));
    expect(Object.keys(CELEBRITY_ALIASES).filter(s => slugs.has(s))).toEqual([]);
  });

  it('every retired slug 301s to a live kept page and is gone from data, prerender meta and the sitemap source', () => {
    const slugs = new Set(celebs.map(c => String(c.slug)));
    const meta = celebMeta as Record<string, unknown>;
    expect(Object.keys(RED).length).toBeGreaterThanOrEqual(63);
    for (const [from, to] of Object.entries(RED)) {
      expect(slugs.has(from), from).toBe(false);
      expect(from in meta, from).toBe(false);
      expect(slugs.has(to), to).toBe(true);
      expect(duplicateRedirect(`/celebrity/${from}`)).toBe(`/celebrity/${to}/`);
      expect(duplicateRedirect(`/celebrity/${from}/`)).toBe(`/celebrity/${to}/`);
    }
  });

  it('the named examples', () => {
    expect(celebritySlugRedirect('virat-kohli-1988')).toBe('virat-kohli');
    expect(celebritySlugRedirect('rajinikanth-1950')).toBe('rajinikanth');
    expect(celebritySlugRedirect('ratan-tata-1937')).toBe('ratan-tata');
    expect(celebritySlugRedirect('bhimrao-ramji-ambedkar')).toBe('bhimrao-ambedkar');
    expect(celebritySlugRedirect('a-p-j-abdul-kalam')).toBe('apj-abdul-kalam');
    expect(celebritySlugRedirect('virat-kohli')).toBeNull();
    expect(duplicateRedirect('/celebrity/virat-kohli')).toBeNull();
    expect(duplicateRedirect('/celebrity/bollywood')).toBeNull();
  });

  it('static list: no person twice, so generateAllSlugs never makes a -YYYY twin', () => {
    const keys = INDIAN_CELEBRITIES.map(c => `${normalizeCelebName(c.name)}|${c.birth_date}`);
    expect(new Set(keys).size).toBe(keys.length);
    const slugs = [...generateAllSlugs(INDIAN_CELEBRITIES as unknown as C[]).keys()];
    for (const s of ['virat-kohli-1988', 'rajinikanth-1950', 'nayanthara-1984', 'ratan-tata-1937']) {
      expect(slugs).not.toContain(s);
    }
    expect(slugs).toContain('virat-kohli');
  });
});
