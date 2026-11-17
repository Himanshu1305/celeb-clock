// @vitest-environment jsdom
/**
 * B14 F7 — India 1942–45 war time. IANA Asia/Kolkata = UTC+6:30 from 1 Sep 1942 to
 * 15 Oct 1945 (BornClock's default). Many birth records, and AstroSage's published charts
 * (Amitabh Bachchan, 11 Oct 1942 16:00: time zone 5.5 —
 * https://astrosage.com/celebrity-Horoscope/amitabh-bachchan-birth-chart.asp, fetched in
 * the 17 Nov 2026 audit), give the time in IST (+5:30). One click next to the war-time
 * note reads it that way; the default stays the tz database.
 */
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { CityPicker } from '../CityPicker';
import type { SavedCity } from '@/services/savedProfile';
import { FIXED_IST_ZONE, isIndiaWarTimeBirth, resolveBirthTimezone } from '@/lib/timezone/birthTimezone';
import { birthQuery } from '@/lib/timezone/clientBirth';
import { GET as kundaliGET } from '../../../api/kundali';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ results: [] }), { status: 200 })));
  try { localStorage.clear(); } catch { /* noop */ }
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;
let last: SavedCity | null = null;
function Harness({ dob, time = '10:00' }: { dob: string; time?: string }) {
  const [v, setV] = useState<SavedCity | null>(null);
  return <CityPicker testid="t-city" value={v} dob={dob} time={time} onPick={c => { setV(c); last = c; }} />;
}
async function pickDelhi() {
  fireEvent.change(q('t-city')!, { target: { value: 'Delhi' } });
  await waitFor(() => expect(q('t-city-options')).toBeTruthy(), { timeout: 2000 });
  fireEvent.click(screen.getAllByTestId('t-city-option')[0]);
}

describe('F7: one-click "already in IST (+5:30)" for India 1942–45 births', () => {
  it('offered next to the war-time note; default stays tzdb (+6:30); one click switches to +5:30 and back', async () => {
    render(<Harness dob="1943-08-15" />);
    await pickDelhi();
    expect(q('t-city-confirm')!.textContent).toContain('UTC+6:30 on that date, war time');
    expect(last?.manualTimezone).toBe(false);
    fireEvent.click(q('t-city-war-ist-on')!);
    expect(last).toEqual(expect.objectContaining({ timezone: FIXED_IST_ZONE, manualTimezone: true }));
    expect(q('t-city-confirm')!.textContent).toContain('UTC+5:30');
    expect(q('t-city-war-ist')!.textContent).toContain('already in IST');
    fireEvent.click(q('t-city-war-ist-off')!);
    expect(last).toEqual(expect.objectContaining({ timezone: 'Asia/Kolkata', manualTimezone: false }));
  });
  it('not offered outside the window (1946) or outside India', async () => {
    render(<Harness dob="1946-03-01" />);
    await pickDelhi();
    expect(q('t-city-war-ist')).toBeNull();
    expect(isIndiaWarTimeBirth('1943-01-01', 'Asia/Karachi')).toBe(false);
    expect(isIndiaWarTimeBirth('1942-08-31', 'Asia/Kolkata')).toBe(false);
    expect(isIndiaWarTimeBirth('1942-09-01', 'Asia/Kolkata')).toBe(true);
    expect(isIndiaWarTimeBirth('1945-10-14', 'Asia/Kolkata')).toBe(true);
  });
  it('the resolver reads the fixed IST zone as +5:30 (1 h later in UTC than war time)', () => {
    const base = { lat: 25.4358, lon: 81.8463, year: 1942, month: 10, day: 11, hour: 16, minute: 0 };
    const war = resolveBirthTimezone(base);
    const ist = resolveBirthTimezone({ ...base, timezone: FIXED_IST_ZONE });
    expect(war.utcOffsetHours).toBe(6.5);
    expect(ist.utcOffsetHours).toBe(5.5);
    expect(Date.parse(ist.utcISO) - Date.parse(war.utcISO)).toBe(3600_000);
  });
  it('Amitabh (Allahabad, 11 Oct 1942 16:00) read as IST gives AstroSage\'s Aquarius Lagna ~21°', async () => {
    vi.stubEnv('SUPABASE_URL', ''); vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');
    const city = { name: 'Allahabad', lat: 25.4358, lon: 81.8463, tz: 6.5, timezone: FIXED_IST_ZONE, manualTimezone: true };
    const qs = birthQuery('1942-10-11', '16:00', city);
    expect(qs.tzid).toBe(FIXED_IST_ZONE);
    const k = await (await kundaliGET(new Request(`http://localhost/api/kundali?${new URLSearchParams(qs as Record<string, string>)}`))).json();
    expect(k.lagna.sign ?? k.lagna.rashi ?? k.lagna.name).toMatch(/Aquarius|Kumbha/);
    // AstroSage prints Aquarius 21°27′; allow a few arc-minutes for the 25.43/81.85 vs AstroSage's coordinates.
    expect(Math.abs((k.lagna.degrees % 30) - (21 + 27 / 60))).toBeLessThan(0.5);
  }, 30_000);
});
