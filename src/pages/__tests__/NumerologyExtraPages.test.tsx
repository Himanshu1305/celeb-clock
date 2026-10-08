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

describe('Chaldean numerology page', () => {
  it('shows Chaldean + Pythagorean side by side and the letter table', () => {
    const { getByTestId } = wrap(<ChaldeanNumerologyPage />);
    expect(getByTestId('chaldean-table')).toBeTruthy();
    fireEvent.change(getByTestId('chaldean-name'), { target: { value: 'Priya Sharma' } });
    fireEvent.click(getByTestId('chaldean-calc'));
    const out = getByTestId('chaldean-result').textContent || '';
    expect(out).toMatch(/Chaldean name number/);
    expect(out).toMatch(/Pythagorean/);
    expect(out).not.toContain('undefined');
  });
});
