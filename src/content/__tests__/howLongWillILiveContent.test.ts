import { describe, it, expect } from 'vitest';
import {
  HLWIL_SEO, HLWIL_SCHEMA, HLWIL_COUNTRY_TABLE,
  HLWIL_FACTORS, HLWIL_COPY,
} from '../howLongWillILiveContent';

describe('HLWIL_SEO', () => {

  it('TC-CF-01: title ≤ 70 chars', () => expect(HLWIL_SEO.title.length).toBeLessThanOrEqual(70));
  it('TC-CF-02: title contains "how long will i live"', () => expect(HLWIL_SEO.title.toLowerCase()).toContain('how long will i live'));
  it('TC-CF-03: title contains "BornClock"', () => expect(HLWIL_SEO.title).toContain('BornClock'));
  it('TC-CF-04: meta ≤ 160 chars', () => expect(HLWIL_SEO.description.length).toBeLessThanOrEqual(160));
  it('TC-CF-05: meta ≥ 50 chars', () => expect(HLWIL_SEO.description.length).toBeGreaterThanOrEqual(50));
  it('TC-CF-06: canonical contains /how-long-will-i-live', () => {
    expect(HLWIL_SEO.canonicalUrl).toContain('/how-long-will-i-live');
    expect(HLWIL_SEO.canonicalUrl.startsWith('https://bornclock.com')).toBe(true);
  });
  it('TC-CF-07: og:title ≤ 95 chars', () => expect(HLWIL_SEO.ogTitle.length).toBeLessThanOrEqual(95));
  it('TC-CF-08: og:description ≤ 200 chars', () => expect(HLWIL_SEO.ogDescription.length).toBeLessThanOrEqual(200));

});

describe('HLWIL_SCHEMA', () => {

  it('TC-CF-09: SoftwareApp @type correct', () => expect(HLWIL_SCHEMA.softwareApp['@type']).toBe('SoftwareApplication'));
  it('TC-CF-10: offer price is "0"', () => expect(HLWIL_SCHEMA.softwareApp.offers.price).toBe('0'));
  it('TC-CF-11: FAQ ≥ 6 questions', () => expect(HLWIL_SCHEMA.faq.mainEntity.length).toBeGreaterThanOrEqual(6));
  it('TC-CF-12: all FAQ names > 10 chars', () => {
    HLWIL_SCHEMA.faq.mainEntity.forEach(q => expect(q.name.length).toBeGreaterThan(10));
  });
  it('TC-CF-13: all FAQ answers > 50 chars', () => {
    HLWIL_SCHEMA.faq.mainEntity.forEach(q => expect(q.acceptedAnswer.text.length).toBeGreaterThan(50));
  });
  it('TC-CF-14: "how long will i live" FAQ exists', () => {
    expect(HLWIL_SCHEMA.faq.mainEntity.find(q =>
      q.name.toLowerCase().includes('how long will i live')
    )).toBeTruthy();
  });
  it('TC-CF-15: India FAQ exists', () => {
    expect(HLWIL_SCHEMA.faq.mainEntity.find(q =>
      q.name.toLowerCase().includes('india')
    )).toBeTruthy();
  });
  it('TC-CF-16: all schemas serialize to valid JSON', () => {
    expect(() => JSON.stringify(HLWIL_SCHEMA.softwareApp)).not.toThrow();
    expect(() => JSON.stringify(HLWIL_SCHEMA.faq)).not.toThrow();
    expect(() => JSON.stringify(HLWIL_SCHEMA.breadcrumb)).not.toThrow();
  });
  it('TC-CF-17: BreadcrumbList has 3 items', () => {
    expect(HLWIL_SCHEMA.breadcrumb.itemListElement.length).toBe(3);
  });
  it('TC-CF-18: breadcrumb item 3 points to /how-long-will-i-live', () => {
    expect(HLWIL_SCHEMA.breadcrumb.itemListElement[2].item).toContain('/how-long-will-i-live');
  });
  it('TC-CF-19: breadcrumb item 2 points to /longevity-calculator', () => {
    expect(HLWIL_SCHEMA.breadcrumb.itemListElement[1].item).toContain('/longevity-calculator');
  });

});

describe('HLWIL_COUNTRY_TABLE', () => {

  it('TC-CF-20: at least 15 countries', () => expect(HLWIL_COUNTRY_TABLE.length).toBeGreaterThanOrEqual(15));
  it('TC-CF-21: Japan is rank 1 with expectancy > 83', () => {
    const japan = HLWIL_COUNTRY_TABLE.find(c => c.country === 'Japan');
    expect(japan?.rank).toBe(1);
    expect(japan?.expectancy).toBeGreaterThan(83);
  });
  it('TC-CF-22: India present with expectancy 65-80', () => {
    const india = HLWIL_COUNTRY_TABLE.find(c => c.country === 'India');
    expect(india).toBeTruthy();
    expect(india?.expectancy).toBeGreaterThan(65);
    expect(india?.expectancy).toBeLessThan(80);
  });
  it('TC-CF-23: all expectancy values between 40 and 95', () => {
    HLWIL_COUNTRY_TABLE.forEach(c => {
      expect(c.expectancy).toBeGreaterThan(40);
      expect(c.expectancy).toBeLessThan(95);
    });
  });
  it('TC-CF-24: female expectancy > male for ALL countries', () => {
    HLWIL_COUNTRY_TABLE.forEach(c => {
      expect(c.female).toBeGreaterThan(c.male);
    });
  });
  it('TC-CF-25: overall expectancy is between male and female', () => {
    HLWIL_COUNTRY_TABLE.forEach(c => {
      expect(c.expectancy).toBeGreaterThanOrEqual(c.male - 0.1);
      expect(c.expectancy).toBeLessThanOrEqual(c.female + 0.1);
    });
  });
  it('TC-CF-26: US expectancy between 74 and 80', () => {
    const us = HLWIL_COUNTRY_TABLE.find(c => c.country === 'United States');
    expect(us?.expectancy).toBeGreaterThan(74);
    expect(us?.expectancy).toBeLessThan(80);
  });
  it('TC-CF-27: no undefined or null values', () => {
    HLWIL_COUNTRY_TABLE.forEach(c => {
      const str = JSON.stringify(c);
      expect(str).not.toContain('undefined');
      expect(str).not.toContain('null');
    });
  });
  it('TC-CF-28: ranks are sequential starting at 1', () => {
    const ranks = [...HLWIL_COUNTRY_TABLE].sort((a, b) => a.rank - b.rank).map(c => c.rank);
    expect(ranks[0]).toBe(1);
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i] - ranks[i - 1]).toBeLessThanOrEqual(1);
    }
  });

});

describe('HLWIL_FACTORS', () => {

  it('TC-CF-29: exactly 8 factors', () => expect(HLWIL_FACTORS.length).toBe(8));
  it('TC-CF-30: factors numbered 1-8 in order', () => {
    expect(HLWIL_FACTORS.map(f => f.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('TC-CF-31: all factors have name, impact, detail, source', () => {
    HLWIL_FACTORS.forEach(f => {
      expect(f.name.length).toBeGreaterThan(3);
      expect(f.impact.length).toBeGreaterThan(5);
      expect(f.detail.length).toBeGreaterThan(30);
      expect(f.source.length).toBeGreaterThan(10);
    });
  });
  it('TC-CF-32: all direction values are negative/positive/mixed', () => {
    HLWIL_FACTORS.forEach(f => expect(['negative','positive','mixed']).toContain(f.direction));
  });
  it('TC-CF-33: ≥ 3 negative, ≥ 2 positive factors', () => {
    expect(HLWIL_FACTORS.filter(f => f.direction === 'negative').length).toBeGreaterThanOrEqual(3);
    expect(HLWIL_FACTORS.filter(f => f.direction === 'positive').length).toBeGreaterThanOrEqual(2);
  });
  it('TC-CF-34: no factor has undefined or [object Object]', () => {
    HLWIL_FACTORS.forEach(f => {
      const str = JSON.stringify(f);
      expect(str).not.toContain('undefined');
      expect(str).not.toContain('[object Object]');
    });
  });

});

describe('HLWIL_COPY', () => {

  it('TC-CF-35: H1 contains "How Long Will I Live"', () => {
    expect(HLWIL_COPY.hero.h1.toLowerCase()).toContain('how long will i live');
  });
  it('TC-CF-36: exactly 4 trust signals', () => expect(HLWIL_COPY.hero.trust.length).toBe(4));
  it('TC-CF-37: exactly 4 stat cards', () => expect(HLWIL_COPY.directAnswer.stats.length).toBe(4));
  it('TC-CF-38: stat cards include Japan and India values', () => {
    const labels = HLWIL_COPY.directAnswer.stats.map(s => s.label);
    const values = HLWIL_COPY.directAnswer.stats.map(s => s.value);
    expect(labels.some(l => l.toLowerCase().includes('japan'))).toBe(true);
    expect(labels.some(l => l.toLowerCase().includes('india'))).toBe(true);
    expect(values.some(v => v.includes('73'))).toBe(true); // global avg
  });
  it('TC-CF-39: exactly 4 howToImprove steps', () => expect(HLWIL_COPY.howToImprove.steps.length).toBe(4));
  it('TC-CF-40: steps numbered 1-4 in order', () => {
    expect(HLWIL_COPY.howToImprove.steps.map(s => s.step)).toEqual([1, 2, 3, 4]);
  });
  it('TC-CF-41: exactly 4 related tools', () => expect(HLWIL_COPY.relatedTools.length).toBe(4));
  it('TC-CF-42: all related tool hrefs start with /', () => {
    HLWIL_COPY.relatedTools.forEach(t => expect(t.href.startsWith('/')).toBe(true));
  });
  it('TC-CF-43: no related tool links to itself', () => {
    HLWIL_COPY.relatedTools.forEach(t => expect(t.href).not.toContain('how-long-will-i-live'));
  });
  it('TC-CF-44: ≥ 5 science citations', () => expect(HLWIL_COPY.science.citations.length).toBeGreaterThanOrEqual(5));
  it('TC-CF-45: Harvard in citations', () => {
    expect(HLWIL_COPY.science.citations.some(c => c.source.toLowerCase().includes('harvard'))).toBe(true);
  });
  it('TC-CF-46: Karolinska in citations', () => {
    expect(HLWIL_COPY.science.citations.some(c => c.source.toLowerCase().includes('karolinska'))).toBe(true);
  });
  it('TC-CF-47: ≥ 2 honestLimits paragraphs', () => expect(HLWIL_COPY.honestLimits.paras.length).toBeGreaterThanOrEqual(2));
  it('TC-CF-48: ≥ 2 whyAveragesMislead paragraphs', () => expect(HLWIL_COPY.whyAveragesMislead.paras.length).toBeGreaterThanOrEqual(2));
  it('TC-CF-49: ≥ 2 gapAnalysis paragraphs', () => expect(HLWIL_COPY.gapAnalysis.paras.length).toBeGreaterThanOrEqual(2));
  it('TC-CF-50: no content has undefined or [object Object]', () => {
    const all = JSON.stringify(HLWIL_COPY);
    expect(all).not.toContain('undefined');
    expect(all).not.toContain('[object Object]');
  });

});
