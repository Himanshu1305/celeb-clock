// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AttitudeNumberPage from '../AttitudeNumberPage';
import ChaldeanNumerologyPage from '../ChaldeanNumerologyPage';

afterEach(cleanup);

const wrap = (ui: React.ReactElement) => render(<HelmetProvider><MemoryRouter>{ui}</MemoryRouter></HelmetProvider>);

describe('Attitude/Birthday number page', () => {
  it('computes both numbers from a valid DOB', () => {
    const { getByTestId } = wrap(<AttitudeNumberPage />);
    fireEvent.change(getByTestId('att-day'), { target: { value: '13' } });
    fireEvent.change(getByTestId('att-month'), { target: { value: '5' } });
    fireEvent.click(getByTestId('att-calc'));
    const out = getByTestId('att-result').textContent || '';
    expect(out).toMatch(/Birthday number/);
    expect(out).toMatch(/Attitude/);
    expect(out).not.toContain('undefined');
  });

  it('rejects an invalid date', () => {
    const { getByTestId, queryByTestId } = wrap(<AttitudeNumberPage />);
    fireEvent.change(getByTestId('att-day'), { target: { value: '45' } });
    fireEvent.change(getByTestId('att-month'), { target: { value: '13' } });
    fireEvent.click(getByTestId('att-calc'));
    expect(getByTestId('att-error')).toBeTruthy();
    expect(queryByTestId('att-result')).toBeNull();
  });
});

describe('Chaldean numerology page (Batch 9: chart explainer, calculator on /name-numerology)', () => {
  it('shows the letter table, the Shah Rukh Khan worked example and links to the calculator', () => {
    const { getByTestId } = wrap(<ChaldeanNumerologyPage />);
    expect(getByTestId('chaldean-table')).toBeTruthy();
    const ex = getByTestId('chaldean-example').textContent || '';
    expect(ex).toContain('42');
    expect(ex).toMatch(/= 6/);
    expect(getByTestId('chaldean-cta').getAttribute('href')).toBe('/name-numerology');
    const list = getByTestId('compound-list').textContent || '';
    for (const n of [39, 42, 48, 49, 50, 51, 52]) expect(list).toContain(`${n} — `);
    expect(document.body.textContent).not.toContain('undefined');
  });
});
