// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LegacyRedirect } from '../LegacyRedirect';

// Batch 6 (SEO): in-app links to a retired duplicate URL must land on the kept page
// (same mapping as the Worker 301). Mirrors the App.tsx route shapes.
afterEach(cleanup);

function Where() {
  const l = useLocation();
  return <div data-testid="where">{l.pathname + l.search}</div>;
}

function renderAt(path: string) {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/born-on/:month/:day/personality" element={<LegacyRedirect />} />
        <Route path="/born-on/:month/:day" element={<LegacyRedirect />} />
        <Route path="/born-on/:slug/india" element={<LegacyRedirect fallback={<div data-testid="india-page" />} />} />
        <Route path="/born-on/:slug" element={<LegacyRedirect fallback={<div data-testid="born-on-page" />} />} />
        <Route path="/birthday/:month/:day" element={<LegacyRedirect fallback={<div data-testid="birthday-page" />} />} />
        <Route path="/birthday/:month" element={<LegacyRedirect fallback={<div data-testid="month-page" />} />} />
        <Route path="/biological-age-calculator" element={<LegacyRedirect otherwise="/biological-age/" />} />
        <Route path="*" element={null} />
      </Routes>
      <Where />
    </MemoryRouter>,
  );
  return utils;
}

describe('LegacyRedirect', () => {
  it.each([
    ['/born-on/august/6/personality', '/birthday/8/6/'],
    ['/born-on/february/29/personality', '/birthday/2/29/'],
    ['/born-on/may/13?ref=x', '/born-on/may-13/india/?ref=x'],
    ['/birthday/june-13', '/born-on/june-13/'],
    ['/biological-age-calculator', '/biological-age/'],
  ])('%s → %s', (from, to) => {
    const { getByTestId } = renderAt(from);
    expect(getByTestId('where').textContent).toBe(to);
  });

  it('kept pages render their own component', () => {
    expect(renderAt('/birthday/8/6').getByTestId('birthday-page')).toBeTruthy();
    cleanup();
    expect(renderAt('/birthday/8').getByTestId('month-page')).toBeTruthy();
    cleanup();
    expect(renderAt('/born-on/august-6').getByTestId('born-on-page')).toBeTruthy();
  });

  it('retired route with an impossible date goes to the born-on index', () => {
    expect(renderAt('/born-on/february/30').getByTestId('where').textContent).toBe('/born-on');
  });
});
