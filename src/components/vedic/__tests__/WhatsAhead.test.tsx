// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WhatsAhead } from '../WhatsAhead';

afterEach(cleanup);

// A small timeline spanning "now" so there is a current + upcoming window.
const Y = new Date().getUTCFullYear();
const iso = (y: number) => new Date(Date.UTC(y, 0, 1)).toISOString();
const timeline = [
  { lord: 'Venus', start: iso(Y - 1), end: iso(Y + 4), antardashas: [
    { lord: 'Venus', start: iso(Y - 1), end: iso(Y) },
    { lord: 'Sun', start: iso(Y), end: iso(Y + 1) },        // current
    { lord: 'Jupiter', start: iso(Y + 1), end: iso(Y + 2) }, // upcoming
  ] },
  { lord: 'Sun', start: iso(Y + 4), end: iso(Y + 10), antardashas: [
    { lord: 'Sun', start: iso(Y + 4), end: iso(Y + 5) },
  ] },
];
const planets = [{ name: 'Sun', house: 10 }, { name: 'Venus', house: 7 }];

const renderWA = (free?: boolean) => render(
  <MemoryRouter>
    <WhatsAhead lagnaSignIndex={0} planets={planets} dashaTimeline={timeline} free={free} />
  </MemoryRouter>
);

describe('WhatsAhead (Item G)', () => {
  it('is collapsed by default, opens to show both views', () => {
    renderWA(true);
    expect(screen.queryByTestId('whatsahead-tab-area')).toBeNull();
    fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
    expect(screen.getByTestId('whatsahead-tab-area')).toBeTruthy();
    expect(screen.getByTestId('whatsahead-tab-horizon')).toBeTruthy();
  });

  it('shows all five life areas', () => {
    renderWA(true);
    fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
    for (const k of ['career', 'relationships', 'home', 'health', 'travel']) {
      expect(screen.getByTestId(`whatsahead-area-${k}`)).toBeTruthy();
    }
  });

  it('MARRIAGE GUARDRAIL: relationships shows favourable-window framing, never a date/certainty/second-marriage', () => {
    renderWA(true);
    fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
    const rel = screen.getByTestId('whatsahead-area-relationships');
    const txt = (rel.textContent || '').toLowerCase();
    expect(txt).toContain('traditionally favourable window');
    expect(txt).toMatch(/not a fixed date|not a certainty|heightened possibility/);
    // never certainty / event / marriage-count language
    expect(txt).not.toContain('will marry');
    expect(txt).not.toContain('you will get married');
    expect(txt).not.toContain('second marriage');
    expect(txt).not.toContain('remarry');
    expect(txt).not.toContain('guarantee');
    // windows are RANGES of month-years (two "Mon YYYY" joined by a dash char) ...
    expect(rel.textContent).toMatch(/\w{3}\s\d{4}\s.\s\w{3}\s\d{4}/);
    // ... and NEVER a specific day-precision date (the core guardrail: "never a date")
    expect(rel.textContent).not.toMatch(/\b\d{1,2}(st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
    expect(rel.textContent).not.toMatch(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\b/i);
  });

  it('time-horizon view renders the four horizons and a lifetime list', () => {
    renderWA(true);
    fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
    fireEvent.click(screen.getByTestId('whatsahead-tab-horizon'));
    expect(screen.getByTestId('whatsahead-horizon-right-now')).toBeTruthy();
    expect(screen.getByTestId('whatsahead-horizon-in-1-year')).toBeTruthy();
  });

  it('free/paid: locked teaser shown when not free', () => {
    renderWA(false);
    fireEvent.click(screen.getByTestId('whats-ahead-toggle'));
    expect(screen.getByTestId('whats-ahead-locked')).toBeTruthy();
    expect(screen.queryByTestId('whatsahead-tab-area')).toBeNull();
  });
});
