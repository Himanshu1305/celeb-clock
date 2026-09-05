// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from '../SEO';

afterEach(cleanup);
const renderSEO = (props: Record<string, unknown>) =>
  render(<HelmetProvider><SEO title="Test Page" {...props} /></HelmetProvider>);

describe('SEO Open Graph + Twitter cards (TC-OG)', () => {
  it('TC-OG-01: renders og:image meta tag', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => expect(document.head.querySelector('meta[property="og:image"]')).toBeTruthy());
  });
  it('TC-OG-02: og:image URL is absolute (https)', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => {
      const og = document.head.querySelector('meta[property="og:image"]');
      expect(og?.getAttribute('content')?.startsWith('https://')).toBe(true);
    });
  });
  it('TC-OG-03: twitter:card meta tag present', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => expect(document.head.querySelector('meta[name="twitter:card"]')).toBeTruthy());
  });
  it('TC-OG-04: og:type article on article pages', async () => {
    renderSEO({ canonicalUrl: '/x', ogType: 'article' });
    await waitFor(() => {
      const t = document.head.querySelector('meta[property="og:type"]');
      expect(t?.getAttribute('content')).toBe('article');
    });
  });
  it('TC-OG-05: og:type website by default', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => {
      const t = document.head.querySelector('meta[property="og:type"]');
      expect(t?.getAttribute('content')).toBe('website');
    });
  });
  it('TC-OG-06: twitter:image present and absolute', async () => {
    renderSEO({ canonicalUrl: '/x' });
    await waitFor(() => {
      const ti = document.head.querySelector('meta[name="twitter:image"]');
      expect(ti?.getAttribute('content')?.startsWith('https://')).toBe(true);
    });
  });
});
