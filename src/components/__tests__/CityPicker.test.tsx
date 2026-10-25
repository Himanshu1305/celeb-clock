// @vitest-environment jsdom
// f5-city-picker — the shared birth-city picker: same-name places, confirm line,
// keyboard/ARIA, and "free text is never accepted".
// Suggestions here come from the bundled offline dataset (no network). Coordinates of the
// same-name places: English Wikipedia city articles. Offsets: IANA tzdb (see placeConfirm.test.ts).
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { CityPicker } from '../CityPicker';
import { BirthDetailsForm } from '../BirthDetailsForm';
import type { SavedCity } from '@/services/savedProfile';

let fetchSpy: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchSpy = vi.fn(async () => new Response(JSON.stringify({ results: [] }), { status: 200 }));
  vi.stubGlobal('fetch', fetchSpy);
  try { localStorage.clear(); } catch { /* noop */ }
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement | null;

function Harness({ dob = '1999-12-03', time = '11:03', onPick }: { dob?: string; time?: string; onPick?: (c: SavedCity | null) => void }) {
  const [v, setV] = useState<SavedCity | null>(null);
  return <CityPicker testid="t-city" value={v} dob={dob} time={time} onPick={c => { setV(c); onPick?.(c); }} />;
}

const optionTexts = async () => {
  await waitFor(() => expect(q('t-city-options')).toBeTruthy(), { timeout: 2000 });
  return screen.getAllByTestId('t-city-option').map(b => b.textContent);
};

describe('CityPicker — same-name places show state / country', () => {
  it.each([
    ['Hyderabad', ['Hyderabad, Telangana, India', 'Hyderabad, Sindh, Pakistan']],
    ['Pontiac', ['Pontiac, Michigan, USA', 'Pontiac, Illinois, USA']],
    ['Portland', ['Portland, Oregon, USA', 'Portland, Maine, USA']],
    ['London', ['London, England, UK', 'London, Ontario, Canada']],
  ])('%s', async (name, expected) => {
    render(<Harness />);
    fireEvent.change(q('t-city')!, { target: { value: name } });
    expect(await optionTexts()).toEqual(expected);
    expect(fetchSpy).not.toHaveBeenCalled(); // bundled — no network
  });

  it('Delhi suggestion names its state and country', async () => {
    render(<Harness />);
    fireEvent.change(q('t-city')!, { target: { value: 'Delhi' } });
    expect(await optionTexts()).toEqual(['Delhi, Delhi, India']);
  });
});

describe('CityPicker — confirm line after picking', () => {
  it('Pontiac, Michigan on 3 Dec 1999 → America/Detroit, UTC−5, standard time; lat/lon/tz saved', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    fireEvent.change(q('t-city')!, { target: { value: 'Pontiac' } });
    await optionTexts();
    fireEvent.click(screen.getAllByTestId('t-city-option')[0]);
    expect(q('t-city-confirm')!.textContent).toContain(
      'Born in Pontiac, Michigan, USA · time zone America/Detroit (UTC−5 on that date, standard time)');
    expect(onPick).toHaveBeenLastCalledWith(expect.objectContaining({
      name: 'Pontiac, Michigan, USA', lat: 42.64611, lon: -83.2925, timezone: 'America/Detroit', tz: -5, manualTimezone: false,
    }));
  });

  it('Hyderabad, Sindh → Asia/Karachi (not IST)', async () => {
    const onPick = vi.fn();
    render(<Harness dob="1990-05-01" time="10:00" onPick={onPick} />);
    fireEvent.change(q('t-city')!, { target: { value: 'Hyderabad' } });
    await optionTexts();
    fireEvent.click(screen.getAllByTestId('t-city-option')[1]);
    expect(q('t-city-confirm')!.textContent).toContain('Born in Hyderabad, Sindh, Pakistan · time zone Asia/Karachi (UTC+5 on that date)');
    expect(onPick).toHaveBeenLastCalledWith(expect.objectContaining({ timezone: 'Asia/Karachi', tz: 5 }));
  });

  it('Delhi 1945 → war-time note in the line + pre-1970 note', async () => {
    render(<Harness dob="1945-03-01" time="10:00" />);
    fireEvent.change(q('t-city')!, { target: { value: 'Delhi' } });
    await optionTexts();
    fireEvent.click(screen.getAllByTestId('t-city-option')[0]);
    expect(q('t-city-confirm')!.textContent).toContain('(UTC+6:30 on that date, war time — clocks were 1 hour ahead of the usual UTC+5:30)');
    expect(q('t-city-pre1970')).toBeTruthy();
  });

  it('Edit focuses the input; typing then clears the pick (free text is not accepted)', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    fireEvent.change(q('t-city')!, { target: { value: 'Pontiac' } });
    await optionTexts();
    fireEvent.click(screen.getAllByTestId('t-city-option')[0]);
    fireEvent.click(q('t-city-edit')!);
    expect(document.activeElement).toBe(q('t-city'));
    fireEvent.change(q('t-city')!, { target: { value: 'Pontiac, Michigan, USA x' } });
    expect(onPick).toHaveBeenLastCalledWith(null);
    expect(q('t-city-confirm')).toBeNull();
  });
});

describe('CityPicker — keyboard + ARIA', () => {
  it('combobox/listbox roles; ↓ ↓ Enter picks the second suggestion; Esc closes', async () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} />);
    const input = q('t-city')!;
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    fireEvent.change(input, { target: { value: 'Pontiac' } });
    await optionTexts();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('listbox')).toBeTruthy();
    expect(screen.getAllByRole('option')).toHaveLength(2);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    const activeId = input.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(activeId)!.textContent).toBe('Pontiac, Illinois, USA');
    expect(document.getElementById(activeId)!.getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onPick).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Pontiac, Illinois, USA', timezone: 'America/Chicago', tz: -6 }));
    expect(input.getAttribute('aria-describedby')).toBe(q('t-city-confirm')!.id);

    fireEvent.change(input, { target: { value: 'Portland' } });
    await optionTexts();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(q('t-city-options')).toBeNull();
  });
});

describe('BirthDetailsForm — submit blocked until a place is picked', () => {
  it('typed text alone keeps the button disabled; after picking, lat/lon/IANA zone are submitted', async () => {
    const onSubmit = vi.fn();
    render(<BirthDetailsForm testIdPrefix="f" submitLabel="Go" onSubmit={onSubmit} />);
    fireEvent.change(q('f-dob')!, { target: { value: '1999-12-03' } });
    fireEvent.change(q('f-time')!, { target: { value: '11:03' } });
    fireEvent.change(q('f-city')!, { target: { value: 'Pontiac' } });
    const btn = q('f-generate-btn') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    await waitFor(() => expect(q('f-city-options')).toBeTruthy(), { timeout: 2000 });
    expect(btn.disabled).toBe(true);
    expect(q('f-validation-hint')!.textContent).toMatch(/pick your birth city from the suggestions/i);
    fireEvent.click(btn);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByTestId('f-city-option')[0]);
    expect(btn.disabled).toBe(false);
    fireEvent.click(btn);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      dob: '1999-12-03', time: '11:03',
      city: expect.objectContaining({ name: 'Pontiac, Michigan, USA', lat: 42.64611, lon: -83.2925, timezone: 'America/Detroit', tz: -5 }),
    }));
  });

  it('date changed AFTER picking → the submitted offset is for the final date (EDT in July)', async () => {
    const onSubmit = vi.fn();
    render(<BirthDetailsForm testIdPrefix="f" submitLabel="Go" onSubmit={onSubmit} />);
    fireEvent.change(q('f-dob')!, { target: { value: '1999-12-03' } });
    fireEvent.change(q('f-time')!, { target: { value: '11:03' } });
    fireEvent.change(q('f-city')!, { target: { value: 'Pontiac' } });
    await waitFor(() => expect(q('f-city-options')).toBeTruthy(), { timeout: 2000 });
    fireEvent.click(screen.getAllByTestId('f-city-option')[0]);
    fireEvent.change(q('f-dob')!, { target: { value: '1999-07-03' } });
    expect(q('f-city-confirm')!.textContent).toContain('(UTC−4 on that date, daylight saving)');
    fireEvent.click(q('f-generate-btn')!);
    expect(onSubmit.mock.calls[0][0].city).toMatchObject({ timezone: 'America/Detroit', tz: -4 });
  });
});
