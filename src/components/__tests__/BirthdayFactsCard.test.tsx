// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BirthdayFactsCard } from '../BirthdayFactsCard';

describe('BirthdayFactsCard', () => {
  afterEach(() => cleanup());

  it('renders real birthday facts: day of week, zodiac, generation', () => {
    // 5 Nov 1990 was a Monday; Scorpio; Millennial.
    render(<BirthdayFactsCard name="Priya" birthDate={new Date('1990-11-05T12:00:00')} celebrityTwin="Someone Famous" />);
    expect(screen.getByTestId('birthday-facts-card')).toBeTruthy();
    expect(screen.getByText(/Monday/)).toBeTruthy();
    expect(screen.getByText(/Scorpio/)).toBeTruthy();
    expect(screen.getByText(/Millennial/)).toBeTruthy();
    expect(screen.getByText(/Someone Famous/)).toBeTruthy();
  });

  it('omits the #1 song line when no dataset is present (never fabricates)', () => {
    render(<BirthdayFactsCard birthDate={new Date('1990-11-05T12:00:00')} />);
    expect(screen.queryByText(/#1 song/i)).toBeNull();
  });

  it('exposes Download and Share controls', () => {
    render(<BirthdayFactsCard birthDate={new Date('2000-01-01T12:00:00')} />);
    expect(screen.getByRole('button', { name: /download card/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /share/i })).toBeTruthy();
  });
});
