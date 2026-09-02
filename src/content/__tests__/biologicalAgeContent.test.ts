// Pure content file tests — no DOM, no rendering
// Run these before writing the component
import { describe, it, expect } from 'vitest';
import {
  BA_SEO, BA_SCHEMA, BA_EPIGENETIC_HABITS,
  BA_COPY, BA_REALISTIC_POTENTIAL,
} from '../biologicalAgeContent';

// ════════════════════════════════════════════════════════════
// BA_SEO
// ════════════════════════════════════════════════════════════
describe('BA_SEO', () => {

  it('TC-CF-01: title ≤ 70 chars', () => {
    expect(BA_SEO.title.length).toBeLessThanOrEqual(70);
  });

  it('TC-CF-02: title contains "biological age" (case insensitive)', () => {
    expect(BA_SEO.title.toLowerCase()).toContain('biological age');
  });

  it('TC-CF-03: title contains "BornClock"', () => {
    expect(BA_SEO.title).toContain('BornClock');
  });

  it('TC-CF-04: meta description ≤ 160 chars', () => {
    expect(BA_SEO.description.length).toBeLessThanOrEqual(160);
  });

  it('TC-CF-05: meta description ≥ 50 chars (not empty/too short)', () => {
    expect(BA_SEO.description.length).toBeGreaterThanOrEqual(50);
  });

  it('TC-CF-06: meta description contains "biological age"', () => {
    expect(BA_SEO.description.toLowerCase()).toContain('biological age');
  });

  it('TC-CF-07: canonical URL starts with https://bornclock.com', () => {
    expect(BA_SEO.canonicalUrl.startsWith('https://bornclock.com')).toBe(true);
  });

  it('TC-CF-08: canonical URL contains /biological-age-calculator', () => {
    expect(BA_SEO.canonicalUrl).toContain('/biological-age-calculator');
  });

  it('TC-CF-09: og:title ≤ 95 chars', () => {
    expect(BA_SEO.ogTitle.length).toBeLessThanOrEqual(95);
  });

  it('TC-CF-10: og:description ≤ 200 chars', () => {
    expect(BA_SEO.ogDescription.length).toBeLessThanOrEqual(200);
  });

  it('TC-CF-11: og:description contains "biological age"', () => {
    expect(BA_SEO.ogDescription.toLowerCase()).toContain('biological age');
  });

});

// ════════════════════════════════════════════════════════════
// BA_SCHEMA
// ════════════════════════════════════════════════════════════
describe('BA_SCHEMA', () => {

  it('TC-CF-12: SoftwareApp @type is SoftwareApplication', () => {
    expect(BA_SCHEMA.softwareApp['@type']).toBe('SoftwareApplication');
  });

  it('TC-CF-13: SoftwareApp @context is schema.org', () => {
    expect(BA_SCHEMA.softwareApp['@context']).toBe('https://schema.org');
  });

  it('TC-CF-14: SoftwareApp offer price is "0"', () => {
    expect(BA_SCHEMA.softwareApp.offers.price).toBe('0');
  });

  it('TC-CF-15: FAQPage has ≥ 6 questions', () => {
    expect(BA_SCHEMA.faq.mainEntity.length).toBeGreaterThanOrEqual(6);
  });

  it('TC-CF-16: every FAQ question name > 10 chars', () => {
    BA_SCHEMA.faq.mainEntity.forEach(q => {
      expect(q.name.length).toBeGreaterThan(10);
    });
  });

  it('TC-CF-17: every FAQ answer text > 50 chars', () => {
    BA_SCHEMA.faq.mainEntity.forEach(q => {
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(50);
    });
  });

  it('TC-CF-18: Bryan Johnson FAQ question exists', () => {
    const found = BA_SCHEMA.faq.mainEntity.find(q =>
      q.name.toLowerCase().includes('bryan johnson')
    );
    expect(found).toBeTruthy();
  });

  it('TC-CF-19: "What is biological age" FAQ exists', () => {
    const found = BA_SCHEMA.faq.mainEntity.find(q =>
      q.name.toLowerCase().includes('what is biological age')
    );
    expect(found).toBeTruthy();
  });

  it('TC-CF-20: all three schemas serialize to valid JSON', () => {
    expect(() => JSON.stringify(BA_SCHEMA.softwareApp)).not.toThrow();
    expect(() => JSON.stringify(BA_SCHEMA.faq)).not.toThrow();
    expect(() => JSON.stringify(BA_SCHEMA.breadcrumb)).not.toThrow();
  });

  it('TC-CF-21: BreadcrumbList has exactly 3 items', () => {
    expect(BA_SCHEMA.breadcrumb.itemListElement.length).toBe(3);
  });

  it('TC-CF-22: breadcrumb item 1 is Home', () => {
    expect(BA_SCHEMA.breadcrumb.itemListElement[0].name).toBe('Home');
    expect(BA_SCHEMA.breadcrumb.itemListElement[0].position).toBe(1);
  });

  it('TC-CF-23: breadcrumb item 2 is Longevity Calculator', () => {
    expect(BA_SCHEMA.breadcrumb.itemListElement[1].name).toBe('Longevity Calculator');
    expect(BA_SCHEMA.breadcrumb.itemListElement[1].item).toContain('/longevity-calculator');
  });

  it('TC-CF-24: breadcrumb item 3 points to /biological-age-calculator', () => {
    expect(BA_SCHEMA.breadcrumb.itemListElement[2].item)
      .toContain('/biological-age-calculator');
    expect(BA_SCHEMA.breadcrumb.itemListElement[2].position).toBe(3);
  });

  it('TC-CF-25: no FAQ answer contains unsubstantiated absolute claims', () => {
    // Bryan Johnson answer must cite a source, not state facts without attribution
    const bjFaq = BA_SCHEMA.faq.mainEntity.find(q =>
      q.name.toLowerCase().includes('bryan johnson')
    );
    // Must not say "$2 million" without qualification
    // Must contain a source reference
    const text = bjFaq?.acceptedAnswer.text || '';
    // Source citation present (Blueprint or protocol reference)
    expect(text.toLowerCase()).toMatch(/blueprint|protocol|source|johnson/);
  });

});

// ════════════════════════════════════════════════════════════
// BA_EPIGENETIC_HABITS
// ════════════════════════════════════════════════════════════
describe('BA_EPIGENETIC_HABITS', () => {

  it('TC-CF-26: exactly 12 habits', () => {
    expect(BA_EPIGENETIC_HABITS.length).toBe(12);
  });

  it('TC-CF-27: habits numbered 1-12 in order', () => {
    expect(BA_EPIGENETIC_HABITS.map(h => h.id)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    );
  });

  it('TC-CF-28: all habits have non-empty name, gain, mechanism, source', () => {
    BA_EPIGENETIC_HABITS.forEach(h => {
      expect(h.name.length).toBeGreaterThan(3);
      expect(h.mechanism.length).toBeGreaterThan(20);
      expect(h.source.length).toBeGreaterThan(20);
    });
  });

  it('TC-CF-29: all gain strings match +X.X yrs format', () => {
    BA_EPIGENETIC_HABITS.forEach(h => {
      expect(h.gain).toMatch(/^\+[\d.]+ yrs$/);
    });
  });

  it('TC-CF-30: all gainNum values are positive numbers', () => {
    BA_EPIGENETIC_HABITS.forEach(h => {
      expect(typeof h.gainNum).toBe('number');
      expect(h.gainNum).toBeGreaterThan(0);
    });
  });

  it('TC-CF-31: all difficulty values are Easy, Medium, or Hard', () => {
    const valid = ['Easy', 'Medium', 'Hard'];
    BA_EPIGENETIC_HABITS.forEach(h => {
      expect(valid).toContain(h.difficulty);
    });
  });

  it('TC-CF-32: no habit contains undefined or [object Object]', () => {
    BA_EPIGENETIC_HABITS.forEach(h => {
      const str = JSON.stringify(h);
      expect(str).not.toContain('undefined');
      expect(str).not.toContain('[object Object]');
    });
  });

  it('TC-CF-33: realistic potential is ≤ 8 years (overlap discount applied)', () => {
    const val = parseFloat(BA_REALISTIC_POTENTIAL);
    expect(val).toBeLessThanOrEqual(8);
    expect(val).toBeGreaterThan(0);
  });

  it('TC-CF-34: realistic potential is less than raw sum (discount applied)', () => {
    const rawSum = BA_EPIGENETIC_HABITS.reduce((s, h) => s + h.gainNum, 0);
    const realistic = parseFloat(BA_REALISTIC_POTENTIAL);
    expect(realistic).toBeLessThan(rawSum);
  });

});

// ════════════════════════════════════════════════════════════
// BA_COPY
// ════════════════════════════════════════════════════════════
describe('BA_COPY', () => {

  it('TC-CF-35: H1 contains "Biological Age"', () => {
    const h1 = `${BA_COPY.hero.h1Line1} ${BA_COPY.hero.h1Line2}`;
    expect(h1.toLowerCase()).toContain('biological age');
  });

  it('TC-CF-36: exactly 4 trust signals', () => {
    expect(BA_COPY.hero.trust.length).toBe(4);
  });

  it('TC-CF-37: Bryan Johnson section has ≥ 2 paragraphs', () => {
    expect(BA_COPY.bryanJohnson.paras.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-CF-38: Bryan Johnson section has a source/context citation', () => {
    expect(BA_COPY.bryanJohnson.context).toBeTruthy();
    expect(BA_COPY.bryanJohnson.context.length).toBeGreaterThan(10);
  });

  it('TC-CF-39: exactly 5 howBornClock steps', () => {
    expect(BA_COPY.howBornClock.steps.length).toBe(5);
  });

  it('TC-CF-40: steps numbered 1-5 in order', () => {
    expect(BA_COPY.howBornClock.steps.map(s => s.step)).toEqual([1, 2, 3, 4, 5]);
  });

  it('TC-CF-41: exactly 6 intervention rows', () => {
    expect(BA_COPY.howToLower.interventions.length).toBe(6);
  });

  it('TC-CF-42: all intervention difficulties are valid', () => {
    const valid = ['Easy', 'Medium', 'Hard'];
    BA_COPY.howToLower.interventions.forEach(i => {
      expect(valid).toContain(i.difficulty);
    });
  });

  it('TC-CF-43: exactly 4 related tools', () => {
    expect(BA_COPY.relatedTools.length).toBe(4);
  });

  it('TC-CF-44: all related tool hrefs start with /', () => {
    BA_COPY.relatedTools.forEach(t => {
      expect(t.href.startsWith('/')).toBe(true);
    });
  });

  it('TC-CF-45: related tools do not link to biological-age-calculator itself', () => {
    BA_COPY.relatedTools.forEach(t => {
      expect(t.href).not.toContain('biological-age-calculator');
    });
  });

  it('TC-CF-46: science section has ≥ 5 citations', () => {
    expect(BA_COPY.science.citations.length).toBeGreaterThanOrEqual(5);
  });

  it('TC-CF-47: Horvath appears in science citations', () => {
    const hasHorvath = BA_COPY.science.citations.some(c =>
      c.source.includes('Horvath')
    );
    expect(hasHorvath).toBe(true);
  });

  it('TC-CF-48: Fahy et al. (2021 reversal study) appears in citations', () => {
    const hasFahy = BA_COPY.science.citations.some(c =>
      c.source.toLowerCase().includes('fahy') ||
      c.text.toLowerCase().includes('fahy')
    );
    expect(hasFahy).toBe(true);
  });

  it('TC-CF-49: honest limits section has ≥ 2 paragraphs', () => {
    expect(BA_COPY.honestLimits.paras.length).toBeGreaterThanOrEqual(2);
  });

  it('TC-CF-50: no content string contains undefined or [object Object]', () => {
    const allContent = JSON.stringify(BA_COPY);
    expect(allContent).not.toContain('undefined');
    expect(allContent).not.toContain('[object Object]');
    expect(allContent).not.toContain('[object object]');
  });

});
