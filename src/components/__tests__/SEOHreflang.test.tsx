// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from '../SEO';

afterEach(cleanup);

const renderSEO = (props: Record<string, unknown>) =>
  render(<HelmetProvider><SEO title="Test Page" {...props} /></HelmetProvider>);

describe('SEO hreflang + Open Graph (TC-HRE)', () => {
  it('TC-HRE-P-01: SEO renders hreflang links without crash', () => {
    expect(() => renderSEO({
      canonicalUrl: '/x',
      hreflang: [{ lang: 'en-GB', url: 'https://bornclock.com/x/' }, { lang: 'x-default', url: 'https://bornclock.com/longevity-calculator/' }],
    })).not.toThrow();
  });

  // Batch 6: the UK calculator landing page that carried en-GB hreflang was a duplicate of
  // /life-expectancy-uk and now 301s there, so hreflang is exercised through SEO directly.
  const UK_HREFLANG = [
    { lang: 'en-GB', url: 'https://bornclock.com/life-expectancy-uk/' },
    { lang: 'x-default', url: 'https://bornclock.com/life-expectancy-uk/' },
  ];

  it('TC-HRE-P-02: en-GB hreflang is emitted', async () => {
    renderSEO({ canonicalUrl: '/life-expectancy-uk', hreflang: UK_HREFLANG });
    await waitFor(() => expect(document.head.querySelector('link[rel="alternate"][hreflang="en-GB"]')).toBeTruthy());
  });

  it('TC-HRE-P-03: pages have og:title meta tag', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => expect(document.head.querySelector('meta[property="og:title"]')).toBeTruthy());
  });

  it('TC-HRE-P-04: pages have og:description', async () => {
    renderSEO({ canonicalUrl: '/x', description: 'A description' });
    await waitFor(() => expect(document.head.querySelector('meta[property="og:description"]')).toBeTruthy());
  });

  it('TC-HRE-N-01: SEO works without hreflang prop', () => {
    expect(() => renderSEO({ canonicalUrl: '/x' })).not.toThrow();
  });

  it('TC-HRE-N-02: no hreflang points to undefined URL', async () => {
    renderSEO({ canonicalUrl: '/life-expectancy-uk', hreflang: UK_HREFLANG });
    await waitFor(() => expect(document.head.querySelector('link[rel="alternate"]')).toBeTruthy());
    document.head.querySelectorAll('link[rel="alternate"]').forEach(l => {
      expect(l.getAttribute('href')).not.toContain('undefined');
    });
  });
});
