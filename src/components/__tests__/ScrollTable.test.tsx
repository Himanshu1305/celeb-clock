// @vitest-environment jsdom
// Batch 10: wide tables scroll in their own box and show a "swipe" hint only when the
// table is actually wider than the box (e.g. on a 375 px phone).
import { afterEach, describe, it, expect } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import { ScrollTable } from '../ScrollTable';

afterEach(cleanup);

function mockWidths(scrollWidth: number, clientWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return this.hasAttribute('data-scroll-table') ? scrollWidth : 0; } });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.hasAttribute('data-scroll-table') ? clientWidth : 0; } });
}
const table = <table><tbody><tr><td>a</td><td>b</td></tr></tbody></table>;

describe('ScrollTable', () => {
  it('wraps the table in its own horizontal scroll box', () => {
    mockWidths(300, 343);
    render(<ScrollTable>{table}</ScrollTable>);
    const box = screen.getByTestId('scroll-table');
    expect(box.className).toContain('overflow-x-auto');
    expect(box.querySelector('table')).toBeTruthy();
  });

  it('no hint when the table fits', () => {
    mockWidths(300, 343);
    render(<ScrollTable>{table}</ScrollTable>);
    expect(screen.queryByTestId('table-swipe-hint')).toBeNull();
  });

  it('shows the swipe hint (and a focusable region) when the table is wider than its box', () => {
    mockWidths(620, 343);
    render(<ScrollTable label="Muhurat dates">{table}</ScrollTable>);
    expect(screen.getByTestId('table-swipe-hint').textContent).toContain('Swipe sideways');
    const box = screen.getByTestId('scroll-table');
    expect(box.getAttribute('role')).toBe('region');
    expect(box.getAttribute('aria-label')).toBe('Muhurat dates');
    expect(box.tabIndex).toBe(0);
  });

  it('Hindi hint on Hindi pages', () => {
    mockWidths(620, 343);
    render(<ScrollTable lang="hi">{table}</ScrollTable>);
    expect(screen.getByTestId('table-swipe-hint').textContent).toContain('स्वाइप');
  });
});
