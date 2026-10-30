// @vitest-environment jsdom
// Batch 10: /vrat/:slug and /hi/vrat/:slug — sourced sections, mantras, one FAQPage JSON-LD
// whose answers are in the HTML, the next-date block (browser compute path), festival links.
import { describe, it, expect, afterEach, beforeAll, afterAll, vi } from 'vitest';

beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-29T06:30:00Z')); });
afterAll(() => { vi.useRealTimers(); });
import { render, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import VratPage from '../VratPage';
import FestivalsPage from '../FestivalsPage';
import { VRAT_CONTENT } from '@/lib/vedic/vrats/content';

afterEach(cleanup);
// No precomputed JSON in tests: the hook falls back to computing in the browser.
beforeAll(() => { vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 404 }))); });

function renderPath(path: string) {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/vrat" element={<VratPage />} />
          <Route path="/vrat/:slug" element={<VratPage />} />
          <Route path="/hi/vrat" element={<VratPage lang="hi" />} />
          <Route path="/hi/vrat/:slug" element={<VratPage lang="hi" />} />
          <Route path="/festivals/:year" element={<FestivalsPage />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>,
  );
}

const faqLd = () => [...document.querySelectorAll('script[type="application/ld+json"]')]
  .map(s => { try { return JSON.parse(s.textContent || ''); } catch { return null; } })
  .filter(d => d && d['@type'] === 'FAQPage');

describe('vrat pages', () => {
  it('Karwa Chauth (English): every section with its source, three sourced mantras, one FAQPage, next date today', async () => {
    const { container, getByTestId } = renderPath('/vrat/karwa-chauth');
    expect(container.querySelector('h1')!.textContent).toBe('Karwa Chauth — vrat katha & puja vidhi');
    const c = VRAT_CONTENT['karwa-chauth'];
    for (const s of c.sections) {
      const el = getByTestId(`vrat-section-${s.id}`);
      expect(el.querySelector('[data-testid="vrat-section-sources"] a'), s.id).toBeTruthy();
    }
    expect(getByTestId('vrat-mantras').querySelectorAll('li').length).toBe(3);
    expect(getByTestId('vrat-gentle').textContent).toContain('If you miss a step');
    await waitFor(() => expect(getByTestId('vrat-daily').textContent).toContain('Today, Thursday, 29 October 2026, is Karwa Chauth.'), { timeout: 30_000 });
    expect(getByTestId('vrat-daily').textContent).toContain('20:17');
    await waitFor(() => expect(faqLd().length).toBe(1));
    const body = container.textContent!;
    for (const q of faqLd()[0].mainEntity) expect(body).toContain(q.acceptedAnswer.text);
  }, 60_000);

  it('Ekadashi (Hindi): Hindi headings, the 26-row Ekadashi list, a mantra with meaning', async () => {
    const { container, getByTestId } = renderPath('/hi/vrat/ekadashi');
    expect(container.querySelector('h1')!.textContent).toBe('एकादशी — व्रत कथा और पूजा विधि');
    expect(getByTestId('vrat-section-ekadashis').querySelectorAll('li').length).toBe(26);
    expect(getByTestId('vrat-mantras').textContent).toContain('ॐ नमो भगवते वासुदेवाय');
    expect(getByTestId('vrat-mantras').textContent).toContain('अर्थ');
    expect(getByTestId('vrat-lang-switch').getAttribute('href')).toBe('/vrat/ekadashi/');
    await waitFor(() => expect(getByTestId('vrat-daily').textContent).toContain('रमा एकादशी'), { timeout: 30_000 });
  }, 60_000);

  it('the hub links all ten vrats', () => {
    const { getByTestId } = renderPath('/vrat');
    expect(getByTestId('vrat-hub-cards').querySelectorAll('a').length).toBe(10);
  });

  it('the festival calendar links Ekadashi, Karwa Chauth and Pradosh entries to their vrat pages', () => {
    const { getByTestId, container } = renderPath('/festivals/2026');
    expect(getByTestId('festival-vrat-pages').querySelectorAll('a').length).toBe(11);
    const hrefs = [...container.querySelectorAll('a')].map(a => a.getAttribute('href'));
    for (const h of ['/vrat/ekadashi/', '/vrat/karwa-chauth/', '/vrat/pradosh-vrat/', '/vrat/janmashtami/', '/vrat/mahashivratri/', '/vrat/navratri/']) expect(hrefs, h).toContain(h);
  }, 60_000);
});
