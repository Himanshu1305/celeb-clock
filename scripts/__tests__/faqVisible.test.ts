// Batch 10 — unit tests for the validate-dist V10 FAQ-visibility rule.
import { describe, it, expect } from 'vitest';
// @ts-expect-error — plain ESM build helper, no type declarations
import { faqVisibilityProblems, faqEntries, normalizeText } from '../lib/faqVisible.mjs';

const ld = (o: unknown) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
const faq = (qs: Array<[string, string]>) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: qs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

describe('faqVisible (validate-dist V10)', () => {
  it('passes when every question is visible and every answer is in the HTML (hidden is fine)', () => {
    const html = `<html><head>${ld(faq([['What is BMI?', 'BMI is weight ÷ height².']]))}</head>
      <body><button>What is BMI?</button><div hidden>BMI is weight &divide; height².</div><div hidden>BMI is weight ÷ height².</div></body></html>`;
    expect(faqVisibilityProblems(html)).toEqual([]);
  });

  it('flags a question that exists only in the JSON-LD', () => {
    const html = `<html><body>${ld(faq([['Is BMI accurate?', 'Not always.']]))}<p>Not always.</p></body></html>`;
    expect(faqVisibilityProblems(html).map((p: { kind: string }) => p.kind)).toEqual(['question']);
  });

  it('flags an answer missing from the HTML', () => {
    const html = `<html><body>${ld(faq([['Q one?', 'An answer that is nowhere on the page.']]))}<h3>Q one?</h3></body></html>`;
    expect(faqVisibilityProblems(html).map((p: { kind: string }) => p.kind)).toEqual(['answer']);
  });

  it('does not count the JSON-LD text itself as visible', () => {
    const html = `<html><body>${ld(faq([['Only here?', 'Only here.']]))}</body></html>`;
    expect(faqVisibilityProblems(html)).toHaveLength(2);
  });

  it('reads FAQPage inside @graph and arrays; tolerates entities, curly quotes and spacing', () => {
    const html = `<html><body>${ld({ '@graph': [faq([["What's my sign?", 'It depends — on the date.']])] })}
      <p>What&#39;s   my sign?</p><p>It depends &mdash; on the date.</p><p>It depends - on the date.</p></body></html>`;
    expect(faqEntries(html)).toHaveLength(1);
    expect(faqVisibilityProblems(html)).toEqual([]);
    expect(normalizeText('What’s  “this”?')).toBe(`what's "this"?`);
  });

  it('pages without FAQPage have no problems', () => {
    expect(faqVisibilityProblems('<html><body><p>hi</p></body></html>')).toEqual([]);
  });
});
