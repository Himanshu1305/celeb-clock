// @vitest-environment jsdom
// The browser renders the SAME text the Worker injects, for a fixed date — both from the
// embedded <script id="daily-data"> (Worker path) and from the month JSON.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { DailyBody, DailyH1, DailyDate } from '../DailyParts';
import { useDailyEntry } from '../useDailyEntry';
import { injectDailyHtml, DAILY_DATA_SCRIPT_ID } from '../inject';
import { computeDaily } from '../compute';
import { jsonForScript } from '../render';

afterEach(() => { cleanup(); document.getElementById(DAILY_DATA_SCRIPT_ID)?.remove(); vi.unstubAllGlobals(); });

const SHELL = `<html><head><title>x</title><meta name="description" content="x"></head><body>` +
  `<h1><span data-daily="h1">x</span></h1><span data-daily="date">x</span><div data-daily="body">x</div>` +
  `<script type="application/ld+json" data-daily="jsonld">{}</script></body></html>`;

function serverText(entry: ReturnType<typeof computeDaily>, path: string) {
  const { html } = injectDailyHtml(SHELL, { kind: 'k', slug: 's', path, entry });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return {
    body: doc.querySelector('[data-daily="body"]')!.textContent,
    h1: doc.querySelector('[data-daily="h1"]')!.textContent,
    date: doc.querySelector('[data-daily="date"]')!.textContent,
  };
}

function Probe({ kind, slug }: { kind: string; slug: string }) {
  const { entry, source } = useDailyEntry(kind, slug, () => new Date('2026-10-26T06:30:00Z'));
  return (
    <div data-source={source ?? ''}>
      <h1><DailyH1 entry={entry} fallback="loading" /></h1>
      <DailyDate entry={entry} />
      <DailyBody entry={entry} testId="probe-body" />
    </div>
  );
}

describe('client renders identical text to the Worker', () => {
  for (const [kind, slug, path] of [['rashifal', 'mesh', '/rashifal/mesh/today'], ['rashifal-hi', 'mesha', '/hi/rashifal/mesha'], ['horoscope', 'leo', '/zodiac/leo/today']] as const) {
    it(`${kind}/${slug} via embedded data (no flash, no request)`, async () => {
      const entry = computeDaily(kind, '2026-10-26', slug);
      const s = document.createElement('script');
      s.type = 'application/json';
      s.id = DAILY_DATA_SCRIPT_ID;
      s.textContent = jsonForScript({ kind, slug, date: '2026-10-26', entry });
      document.head.appendChild(s);
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const { getByTestId, container } = render(<Probe kind={kind} slug={slug} />);
      const server = serverText(entry, path);
      expect(getByTestId('probe-body').textContent).toBe(server.body);
      expect(container.querySelector('[data-daily="h1"]')!.textContent).toBe(server.h1);
      expect(container.querySelector('[data-daily="date"]')!.textContent).toBe(server.date);
      expect(container.querySelector('[data-source]')!.getAttribute('data-source')).toBe('embedded');
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  }

  it('via the month JSON when nothing is embedded', async () => {
    const entry = computeDaily('horoscope', '2026-10-26', 'virgo');
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      expect(url).toBe('/daily/horoscope/virgo/2026-10.json');
      return new Response(JSON.stringify({ kind: 'horoscope', slug: 'virgo', month: '2026-10', days: { '2026-10-26': entry } }), { status: 200 });
    }));
    const { getByTestId, container } = render(<Probe kind="horoscope" slug="virgo" />);
    await waitFor(() => expect(container.querySelector('[data-source]')!.getAttribute('data-source')).toBe('json'));
    expect(getByTestId('probe-body').textContent).toBe(serverText(entry, '/zodiac/virgo/today').body);
  });

  it('falls back to computing in the browser when the day is missing', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not found', { status: 404 })));
    const { getByTestId, container } = render(<Probe kind="rashifal" slug="tula" />);
    await waitFor(() => expect(container.querySelector('[data-source]')!.getAttribute('data-source')).toBe('computed'));
    expect(getByTestId('probe-body').textContent).toBe(serverText(computeDaily('rashifal', '2026-10-26', 'tula'), '/rashifal/tula/today').body);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
