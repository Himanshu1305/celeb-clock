// @vitest-environment jsdom
// Batch 10: the browser reads TOMORROW's entry for a "tomorrow" page (embedded by the Worker),
// with no request and no flash.
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DailyBody, DailyH1 } from '../DailyParts';
import { useDailyEntry } from '../useDailyEntry';
import { DAILY_DATA_SCRIPT_ID } from '../inject';
import { computeDaily } from '../compute';
import { jsonForScript } from '../render';

afterEach(() => { cleanup(); document.getElementById(DAILY_DATA_SCRIPT_ID)?.remove(); vi.unstubAllGlobals(); });

function Probe({ kind, slug }: { kind: string; slug: string }) {
  const { entry, source, date } = useDailyEntry(kind, slug, () => new Date('2026-10-26T06:30:00Z'));
  return <div data-source={source ?? ''} data-date={date}><h1><DailyH1 entry={entry} fallback="loading" /></h1><DailyBody entry={entry} testId="probe-body" /></div>;
}

describe('tomorrow pages in the browser', () => {
  for (const [kind, slug] of [['rashifal-tomorrow', 'mesh'], ['horoscope-tomorrow', 'leo']] as const) {
    it(`${kind}: uses the next India date's embedded entry`, () => {
      const entry = computeDaily(kind, '2026-10-27', slug);
      const s = document.createElement('script');
      s.type = 'application/json';
      s.id = DAILY_DATA_SCRIPT_ID;
      s.textContent = jsonForScript({ kind, slug, date: '2026-10-27', entry });
      document.head.appendChild(s);
      const fetchSpy = vi.fn();
      vi.stubGlobal('fetch', fetchSpy);
      const { container } = render(<Probe kind={kind} slug={slug} />);
      expect(container.querySelector('[data-date]')!.getAttribute('data-date')).toBe('2026-10-27');
      expect(container.querySelector('[data-source]')!.getAttribute('data-source')).toBe('embedded');
      expect(container.querySelector('[data-daily="h1"]')!.textContent).toContain('Tomorrow — 27 October 2026');
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  }
});
