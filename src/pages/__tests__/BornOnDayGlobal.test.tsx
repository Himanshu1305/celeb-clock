// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import BornOnDayGlobal from '../BornOnDayGlobal';

afterEach(cleanup);

const renderAt = (path: string) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/born-on/:month/:day" element={<BornOnDayGlobal />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  );

describe('BornOnDayGlobal', () => {
  it('1. renders a valid date (august/6) without crashing', () => {
    const { getByTestId } = renderAt('/born-on/august/6');
    expect(getByTestId('born-on-global-page')).toBeTruthy();
  });

  it('2. H1 does NOT contain "India"', () => {
    const { container } = renderAt('/born-on/august/6');
    const h1 = container.querySelector('h1');
    expect(h1).toBeTruthy();
    expect(h1!.textContent).toContain('August');
    expect(h1!.textContent).toContain('6');
    expect(h1!.textContent).not.toContain('India');
  });

  it('3. canonical / india link points to the India page (contains "/india/")', async () => {
    const { container } = renderAt('/born-on/august/6');
    // Rendered anchor to the India page.
    const indiaLink = Array.from(container.querySelectorAll('a')).find(a =>
      (a.getAttribute('href') || '').includes('/india/')
    );
    expect(indiaLink).toBeTruthy();
    expect(indiaLink!.getAttribute('href')).toContain('/india/');

    // SEO canonical (in <head> via Helmet) also targets the India variant.
    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical).toBeTruthy();
      expect(canonical!.getAttribute('href')).toContain('/india/');
    });
  });

  it('4. celebrity content area / page testid renders', () => {
    const { getByTestId } = renderAt('/born-on/august/6');
    expect(getByTestId('born-on-global-page')).toBeTruthy();
  });

  it('5. multiple dates render without crashing (january/1, december/25)', () => {
    const a = renderAt('/born-on/january/1');
    expect(a.getByTestId('born-on-global-page')).toBeTruthy();
    cleanup();
    const b = renderAt('/born-on/december/25');
    expect(b.getByTestId('born-on-global-page')).toBeTruthy();
  });

  it('6. Feb 29 (february/29) does not crash', () => {
    const { getByTestId, container } = renderAt('/born-on/february/29');
    expect(getByTestId('born-on-global-page')).toBeTruthy();
    expect(container.querySelector('h1')!.textContent).toContain('February');
  });

  it('7. invalid date renders gracefully (no throw)', () => {
    let bad!: ReturnType<typeof renderAt>;
    expect(() => { bad = renderAt('/born-on/february/31'); }).not.toThrow();
    expect(bad.getByTestId('born-on-global-page')).toBeTruthy();
    cleanup();
    let bad2!: ReturnType<typeof renderAt>;
    expect(() => { bad2 = renderAt('/born-on/notamonth/5'); }).not.toThrow();
    expect(bad2.getByTestId('born-on-global-page')).toBeTruthy();
  });

  it('8. no "undefined" / "[object Object]" in body', () => {
    const { container } = renderAt('/born-on/august/6');
    const text = container.textContent || '';
    expect(text).not.toContain('undefined');
    expect(text).not.toContain('[object Object]');
  });
});
