// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import FAQ from '../FAQ';

afterEach(cleanup);

// Batch 9b review: /faq lists 36 Q&As in FAQPage JSON-LD; the answers must be in the
// prerendered HTML (hidden while collapsed), not only after a click.
describe('/faq — answers are in the HTML while collapsed', () => {
  it('every FAQPage answer appears in the page body outside the JSON-LD', async () => {
    const { container } = render(<HelmetProvider><MemoryRouter><FAQ /></MemoryRouter></HelmetProvider>);
    const faqLd = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(s => { try { return JSON.parse(s.textContent || ''); } catch { return null; } })
      .filter(d => d && d['@type'] === 'FAQPage');
    await waitFor(() => expect(faqLd().length).toBe(1)); // Helmet writes it into <head>
    const lds = faqLd();
    const body = container.cloneNode(true) as HTMLElement;
    body.querySelectorAll('script').forEach(s => s.remove());
    const text = body.textContent || '';
    const answers: string[] = lds[0].mainEntity.map((q: { acceptedAnswer: { text: string } }) => q.acceptedAnswer.text);
    expect(answers.length).toBeGreaterThan(10);
    for (const a of answers) expect(text).toContain(a.slice(0, 60));
  });
});
