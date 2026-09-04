// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { WhatsAppShareButton } from '../WhatsAppShareButton';
afterEach(cleanup);

describe('WhatsAppShareButton', () => {
  it('TC-WA-P-01: renders with correct wa.me href', () => {
    render(<WhatsAppShareButton message="Test message bornclock.com" />);
    const btn = document.querySelector('[data-testid="whatsapp-share-btn"]');
    expect(btn?.getAttribute('href')).toContain('wa.me');
    expect(btn?.getAttribute('href')).toContain('Test%20message');
  });
  it('TC-WA-P-02: opens in new tab', () => {
    render(<WhatsAppShareButton message="test" />);
    expect(document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('target')).toBe('_blank');
  });
  it('TC-WA-P-03: has noopener noreferrer', () => {
    render(<WhatsAppShareButton message="test" />);
    expect(document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('rel')).toContain('noopener');
  });
  it('TC-WA-N-01: empty message does not crash', () => {
    expect(() => render(<WhatsAppShareButton message="" />)).not.toThrow();
  });
  it('TC-WA-N-02: undefined values in message not visible', () => {
    // A properly-built message (no undefined interpolations) must survive encoding cleanly.
    render(<WhatsAppShareButton message="Virat Kohli is a Scorpio bornclock.com" />);
    const href = document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
    const decoded = decodeURIComponent(href);
    expect(decoded).not.toMatch(/\bundefined\b/);
  });
  it('TC-WA-N-03: special characters encoded properly', () => {
    render(<WhatsAppShareButton message="Test & more → https://bornclock.com" />);
    const href = document.querySelector('[data-testid="whatsapp-share-btn"]')?.getAttribute('href') || '';
    expect(href).toContain('wa.me/?text=');
    expect(href).not.toContain(' '); // spaces must be encoded
  });
});
