// @vitest-environment jsdom
// Batch 8 — the weekly rashifal page renders the SAME text the Worker injects, for a fixed
// date, from the embedded data and from the per-week data file.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { DailyBody, DailyH1, DailyDate } from '../DailyParts';
import { useDailyEntry } from '../useDailyEntry';
import { injectDailyHtml, DAILY_DATA_SCRIPT_ID } from '../inject';
import { computeDaily, DAILY_DATA_COMPUTERS } from '../compute';
import { jsonForScript } from '../render';

afterEach(() => { cleanup(); document.getElementById(DAILY_DATA_SCRIPT_ID)?.remove(); vi.unstubAllGlobals(); });

const SHELL = `<html><head><title>x</title><meta name="description" content="x"></head><body>` +
  `<h1><span data-daily="h1">x</span></h1><span data-daily="date">x</span><div data-daily="body">x</div>` +
  `<script type="application/ld+json" data-daily="jsonld">{}</script></body></html>`;

function serverText(entry: ReturnType<typeof computeDaily>) {
  const { html } = injectDailyHtml(SHELL, { kind: 'rashifal-week', slug: 'kanya', path: '/rashifal/kanya/week', entry });
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return {
    body: doc.querySelector('[data-daily="body"]')!.innerHTML,
    h1: doc.querySelector('[data-daily="h1"]')!.textContent,
    date: doc.querySelector('[data-daily="date"]')!.textContent,
  };
}

function Probe({ at }: { at: string }) {
  const { entry, source } = useDailyEntry('rashifal-week', 'kanya', () => new Date(at));
  return (
    <div data-source={source ?? ''}>
      <h1><DailyH1 entry={entry} fallback="loading" /></h1>
      <DailyDate entry={entry} />
      <DailyBody entry={entry} testId="probe-body" />
    </div>
  );
}

describe('weekly rashifal: client text identical to the Worker', () => {
  it('via embedded data', () => {
    const entry = computeDaily('rashifal-week', '2026-10-28', 'kanya');
    const s = document.createElement('script');
    s.type = 'application/json';
    s.id = DAILY_DATA_SCRIPT_ID;
    s.textContent = jsonForScript({ kind: 'rashifal-week', slug: 'kanya', date: '2026-10-28', entry });
    document.head.appendChild(s);
    vi.stubGlobal('fetch', vi.fn());
    const { getByTestId, container } = render(<Probe at="2026-10-28T06:30:00Z" />);
    const server = serverText(entry);
    expect(getByTestId('probe-body').innerHTML).toBe(server.body);
    expect(container.querySelector('[data-daily="h1"]')!.textContent).toBe(server.h1);
    expect(server.h1).toBe('Kanya Weekly Rashifal — 26 Oct – 1 Nov 2026');
    expect(container.querySelector('[data-daily="date"]')!.textContent).toBe(server.date);
  });

  it('via the per-week data file (same file the Worker reads)', async () => {
    const fetchSpy = vi.fn(async (url: string) => {
      expect(url).toBe('/daily/rashifal-period/week/2026-10-26.json');
      const data = { '2026-10-26': DAILY_DATA_COMPUTERS['rashifal-period']('2026-10-26', 'week') };
      return new Response(JSON.stringify({ kind: 'rashifal-period', slug: 'week', month: '2026-10-26', data }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchSpy);
    const { getByTestId, container } = render(<Probe at="2026-10-30T06:30:00Z" />);
    await waitFor(() => expect(container.querySelector('[data-source]')!.getAttribute('data-source')).toBe('json'));
    const server = serverText(computeDaily('rashifal-week', '2026-10-30', 'kanya'));
    expect(getByTestId('probe-body').innerHTML).toBe(server.body);
    expect(container.querySelector('[data-daily="date"]')!.textContent).toBe('26 October – 1 November 2026');
  });
});
