// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ReviewerByline } from '../ReviewerByline';
import { EXPERT_REVIEWERS } from '@/config/reviewers';

describe('ReviewerByline — never invents a reviewer', () => {
  afterEach(() => cleanup());

  it('ships with an EMPTY reviewer registry (no fabricated experts)', () => {
    expect(Object.keys(EXPERT_REVIEWERS).length).toBe(0);
  });

  it('renders nothing when no reviewer is registered', () => {
    const { container } = render(<ReviewerByline reviewerId="does-not-exist" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the name + credentials when a real reviewer is supplied', () => {
    render(
      <ReviewerByline
        reviewer={{ id: 'x', name: 'Dr Real Person', credentials: 'MD, Internal Medicine', profileUrl: 'https://example.org/dr' }}
        reviewedOn="2026-10-09"
      />,
    );
    expect(screen.getByTestId('reviewer-byline')).toBeTruthy();
    expect(screen.getByText('Dr Real Person')).toBeTruthy();
    expect(screen.getByText(/MD, Internal Medicine/)).toBeTruthy();
    expect(screen.getByText(/9 October 2026/)).toBeTruthy();
  });
});
