// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrustStrip } from '../TrustStrip';

// RC3 Item 4: the trust strip gains an optional "How we test" link to /how-it-works.
describe('TrustStrip', () => {
  it('renders the claim with no link when href is omitted', () => {
    render(<TrustStrip claim="Calculated from your real birth details." />);
    expect(screen.getByText(/Calculated from your real birth details/)).toBeTruthy();
    expect(screen.queryByText(/How we test/)).toBeNull();
  });

  it('renders a How we test link pointing to the given how-it-works section', () => {
    render(<TrustStrip claim="A plain claim." href="/how-it-works#vedic" />);
    const link = screen.getByRole('link', { name: /How we test/ });
    expect(link.getAttribute('href')).toBe('/how-it-works#vedic');
  });
});
