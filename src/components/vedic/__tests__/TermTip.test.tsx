// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeAll, vi } from 'vitest';
import { render, cleanup, fireEvent, screen, act } from '@testing-library/react';
import { TermTip, NumberNote } from '../TermTip';

beforeAll(() => {
  // Radix Popper measures the trigger; jsdom has no ResizeObserver.
  if (!(globalThis as { ResizeObserver?: unknown }).ResizeObserver) {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  }
  // jsdom has no PointerEvent, so pointerType would be dropped; a minimal one keeps it.
  if (!(globalThis as { PointerEvent?: unknown }).PointerEvent) {
    class PointerEventPolyfill extends MouseEvent {
      pointerType: string;
      constructor(type: string, init: PointerEventInit = {}) { super(type, init); this.pointerType = init.pointerType ?? ''; }
    }
    (globalThis as { PointerEvent?: unknown }).PointerEvent = PointerEventPolyfill;
    (window as unknown as { PointerEvent?: unknown }).PointerEvent = PointerEventPolyfill;
  }
});
afterEach(() => { vi.useRealTimers(); cleanup(); });

describe('TermTip — accessible (i) popover', { timeout: 30000 }, () => {
  it('renders a real button whose accessible name keeps the visible text', () => {
    render(<TermTip id="lagna">Lagna</TermTip>);
    const btn = screen.getByRole('button');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.textContent).toMatch(/^Lagna/);            // visible label first (label-in-name)
    expect(btn.textContent).toMatch(/What does .*Lagna.* mean\?/); // screen-reader hint
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
    // the (i) icon is decorative
    expect(btn.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('tap/click opens a labelled dialog with the plain-language text and a glossary link; Escape closes', () => {
    render(<TermTip id="rahuKalam">Rahu Kaal</TermTip>);
    const btn = screen.getByTestId('termtip-rahuKalam');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-label')).toBe('Rahu Kaal');
    expect(btn.getAttribute('aria-controls')).toBe(dialog.id);
    expect(dialog.textContent).toMatch(/90-minute window/);
    const link = dialog.querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/glossary#rahu-kalam');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('keyboard: the trigger is focusable and opens from the keyboard (Enter/Space fire click on a button)', () => {
    render(<TermTip id="tithi">Tithi</TermTip>);
    const btn = screen.getByTestId('termtip-tithi');
    btn.focus();
    expect(document.activeElement).toBe(btn);
    fireEvent.click(btn); // what Enter/Space do on a native <button>
    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('mouse hover opens it (desktop) and leaving closes it', () => {
    vi.useFakeTimers();
    render(<TermTip id="nadi">Nadi</TermTip>);
    const btn = screen.getByTestId('termtip-nadi');
    fireEvent.pointerEnter(btn, { pointerType: 'mouse' });
    act(() => { vi.advanceTimersByTime(100); });
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    fireEvent.pointerLeave(btn, { pointerType: 'mouse' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('touch pointers do not open on "hover" (tap is the gesture)', () => {
    vi.useFakeTimers();
    render(<TermTip id="nadi">Nadi</TermTip>);
    const btn = screen.getByTestId('termtip-nadi');
    fireEvent.pointerEnter(btn, { pointerType: 'touch' });
    act(() => { vi.advanceTimersByTime(200); });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('Hindi mode shows the Hindi name and Hindi explanation', () => {
    render(<TermTip id="rahuKalam" lang="hi">राहु काल</TermTip>);
    fireEvent.click(screen.getByTestId('termtip-rahuKalam'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('राहु काल');
    expect(dialog.textContent).toMatch(/90 मिनट/);
    expect(dialog.textContent).toContain('शब्दकोश');
  });

  it('icon-only variant still has an accessible name', () => {
    render(<TermTip id="koota" iconOnly />);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toMatch(/What does Koota mean\?/);
  });

  it('an unknown id degrades to plain text (no button)', () => {
    render(<TermTip id="no-such-term">Plain</TermTip>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Plain')).toBeTruthy();
  });

  it('NumberNote renders a one-line note, nothing when empty', () => {
    const { container, rerender } = render(<NumberNote testid="n">5 of 7 — a reasonable fit.</NumberNote>);
    expect(container.textContent).toContain('5 of 7');
    rerender(<NumberNote testid="n">{''}</NumberNote>);
    expect(container.querySelector('[data-testid="n"]')).toBeNull();
  });
});
