// @vitest-environment jsdom
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, fireEvent, screen } from '@testing-library/react';
import { DashaDeepDive } from '../DashaDeepDive';

afterEach(cleanup);

const MAHAS = [
  { lord: 'Saturn', start: '2010-01-01T00:00:00.000Z', end: '2029-01-01T00:00:00.000Z' },
  { lord: 'Mercury', start: '2029-01-01T00:00:00.000Z', end: '2046-01-01T00:00:00.000Z' },
];

describe('DashaDeepDive (Item F)', () => {
  it('renders nothing without a timeline', () => {
    const { container } = render(<DashaDeepDive mahadashas={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('is collapsed by default — Mahadasha rows appear only after opening', () => {
    render(<DashaDeepDive mahadashas={MAHAS} />);
    // The section toggle is present...
    expect(screen.getByTestId('dasha-deep-toggle')).toBeTruthy();
    // ...but the Maha rows are not rendered yet (collapsed).
    expect(screen.queryByTestId('dasha-toggle-0')).toBeNull();
    fireEvent.click(screen.getByTestId('dasha-deep-toggle'));
    expect(screen.getByTestId('dasha-toggle-0')).toBeTruthy();
  });

  it('computes children ON DEMAND when a Mahadasha is expanded (9 Antardashas)', () => {
    render(<DashaDeepDive mahadashas={MAHAS} />);
    fireEvent.click(screen.getByTestId('dasha-deep-toggle'));
    // Expand the first Mahadasha -> its 9 Antardashas appear (paths 0/0 .. 0/8).
    expect(screen.queryByTestId('dasha-toggle-0/0')).toBeNull();
    fireEvent.click(screen.getByTestId('dasha-toggle-0'));
    expect(screen.getByTestId('dasha-toggle-0/0')).toBeTruthy();
    expect(screen.getByTestId('dasha-toggle-0/8')).toBeTruthy();
    // Antar can expand to Pratyantar...
    fireEvent.click(screen.getByTestId('dasha-toggle-0/0'));
    expect(screen.getByTestId('dasha-toggle-0/0/0')).toBeTruthy();
  });

  it('shows the birth-time-sensitivity caveat when opened', () => {
    render(<DashaDeepDive mahadashas={MAHAS} />);
    fireEvent.click(screen.getByTestId('dasha-deep-toggle'));
    expect(document.body.textContent).toMatch(/sensitive to your exact birth time/i);
  });
});
