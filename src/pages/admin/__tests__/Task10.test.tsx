// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import AccuracyDashboard from '../AccuracyDashboard';

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);

describe('TC-ADMIN', () => {
  afterEach(() => cleanup());

  it('TC-ADMIN-P-01: renders', () => { render(<AccuracyDashboard />); expect(q('accuracy-dashboard')).toBeTruthy(); });
  it('TC-ADMIN-P-02: >=5 ground truth rows', () => { render(<AccuracyDashboard />); expect(document.querySelectorAll('[data-testid="ground-truth-row"]').length).toBeGreaterThanOrEqual(5); });
  it('TC-ADMIN-P-03: shows Virat Kohli and (Modi\'s correct) Anuradha', () => { render(<AccuracyDashboard />); const b = document.body.textContent || ''; expect(b).toMatch(/Virat Kohli/); expect(b).toMatch(/Anuradha/); });
  it('TC-ADMIN-P-04: accuracy % shown', () => { render(<AccuracyDashboard />); expect(document.body.textContent).toMatch(/accuracy|%/i); });
  it('TC-ADMIN-N-01: no undefined (graceful before async completes)', () => { render(<AccuracyDashboard />); expect(document.body.textContent).not.toContain('undefined'); });
});
