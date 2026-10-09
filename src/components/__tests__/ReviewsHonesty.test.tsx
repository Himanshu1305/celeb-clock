// @vitest-environment jsdom
import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from '../ReviewForm';

// A single supabase mock whose insert spy the test can assert on.
const insertSpy = vi.fn().mockResolvedValue({ error: null });
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ insert: insertSpy }) },
}));

describe('TestimonialsSection — no fabricated content (source invariant)', () => {
  const src = readFileSync(resolve(__dirname, '../TestimonialsSection.tsx'), 'utf8');

  it('filters out the seeded sentinel fake reviews', () => {
    expect(src).toMatch(/isSeededFake/);
    expect(src).toMatch(/00000000-0000-0000-0000/);
  });

  it('no longer prints the fabricated stat numbers (10K\\+, 4.9, 50\\+, 1M\\+)', () => {
    expect(src).not.toContain('10K+');
    expect(src).not.toContain('1M+');
    expect(src).not.toContain('Trusted by thousands worldwide');
  });
});

describe('ReviewForm — real, moderated submissions', () => {
  afterEach(() => { cleanup(); insertSpy.mockClear(); });

  it('requires a rating before submitting', async () => {
    render(<ReviewForm userId="u1" defaultName="Asha" />);
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));
    await waitFor(() => expect(screen.getByText(/pick a star rating/i)).toBeTruthy());
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('submits unapproved (pending moderation) with the real user id', async () => {
    render(<ReviewForm userId="user-123" defaultName="Asha" country="India" />);
    fireEvent.click(screen.getByRole('radio', { name: /5 stars/i }));
    fireEvent.change(screen.getByLabelText(/your review/i), { target: { value: 'Genuinely useful for my family.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit review/i }));
    await waitFor(() => expect(insertSpy).toHaveBeenCalled());
    const row = insertSpy.mock.calls[0][0];
    expect(row.user_id).toBe('user-123');
    expect(row.rating).toBe(5);
    expect(row.is_approved).toBe(false);
    expect(row.is_featured).toBe(false);
  });
});
