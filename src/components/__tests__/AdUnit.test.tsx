// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { AdUnit } from '../AdUnit';

describe('AdUnit — TC-AD', () => {
  afterEach(() => cleanup());

  it('TC-AD-P-01: renders nothing when no VITE_ADSENSE_CLIENT is configured (inert default)', () => {
    const { container } = render(<AdUnit slot="1234567890" />);
    expect(container.querySelector('.adsbygoogle')).toBeFalsy();
    expect(container.firstChild).toBeNull();
  });
  it('TC-AD-N-01: does not throw when rendered', () => {
    expect(() => render(<AdUnit slot="1" />)).not.toThrow();
  });
});
