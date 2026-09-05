// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import BirthdayWishPage from '../BirthdayWishPage';

const renderWish = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/wish']}>
        <BirthdayWishPage />
      </MemoryRouter>
    </HelmetProvider>
  );

const q = (id: string) => document.querySelector(`[data-testid="${id}"]`);
const fillNameDob = (name: string, dob: string) => {
  fireEvent.change(q('wish-name-input')!, { target: { value: name } });
  fireEvent.change(q('wish-dob-input')!, { target: { value: dob } });
};
const generate = () => fireEvent.click(q('wish-generate-btn')!);

describe('Birthday Wish Generator — TC-WISH', () => {
  afterEach(() => cleanup());

  // POSITIVE
  it('TC-WISH-P-01: renders input step without crash', () => {
    expect(() => renderWish()).not.toThrow();
  });
  it('TC-WISH-P-02: name input present', () => {
    renderWish();
    expect(q('wish-name-input')).toBeTruthy();
  });
  it('TC-WISH-P-03: DOB input present', () => {
    renderWish();
    expect(q('wish-dob-input')).toBeTruthy();
  });
  it('TC-WISH-P-04: generate button disabled without name', () => {
    renderWish();
    expect((q('wish-generate-btn') as HTMLButtonElement).disabled).toBe(true);
  });
  it('TC-WISH-P-05: generate button disabled with name but no DOB', () => {
    renderWish();
    fireEvent.change(q('wish-name-input')!, { target: { value: 'Priya' } });
    expect((q('wish-generate-btn') as HTMLButtonElement).disabled).toBe(true);
  });
  it('TC-WISH-P-06: valid name + DOB → wish-card appears', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    expect(q('wish-card')).toBeTruthy();
  });
  it('TC-WISH-P-07: WhatsApp share href contains wa.me', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    expect((q('wish-whatsapp-share') as HTMLAnchorElement).href).toContain('wa.me');
  });
  it('TC-WISH-P-08: WhatsApp message contains friend name', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    const href = decodeURIComponent(q('wish-whatsapp-share')!.getAttribute('href') || '');
    expect(href).toContain('Priya');
  });
  it('TC-WISH-P-09: WhatsApp message contains bornclock.com', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    const href = decodeURIComponent(q('wish-whatsapp-share')!.getAttribute('href') || '');
    expect(href).toContain('bornclock.com');
  });
  it('TC-WISH-P-10: CTA links to /birthday-report', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    const links = Array.from(document.querySelectorAll('a'));
    expect(links.some(l => l.getAttribute('href')?.includes('birthday-report'))).toBe(true);
  });

  // NEGATIVE
  it('TC-WISH-N-01: no "undefined" in WhatsApp message', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    const href = decodeURIComponent(q('wish-whatsapp-share')!.getAttribute('href') || '');
    expect(href).not.toMatch(/\bundefined\b/);
  });
  it('TC-WISH-N-02: no "[object Object]" in message', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    const href = decodeURIComponent(q('wish-whatsapp-share')!.getAttribute('href') || '');
    expect(href).not.toContain('[object Object]');
  });
  it('TC-WISH-N-03: Create Another resets to input step', () => {
    renderWish();
    fillNameDob('Priya', '1990-11-05');
    generate();
    fireEvent.click(q('wish-reset-btn')!);
    expect(q('wish-name-input')).toBeTruthy();
  });

  // EDGE
  it('TC-WISH-EDGE-01: Feb 29 1992 (leap year) → Pisces, no crash', () => {
    renderWish();
    fillNameDob('Leap', '1992-02-29');
    expect(() => generate()).not.toThrow();
    expect(q('wish-card')).toBeTruthy();
    const href = decodeURIComponent(q('wish-whatsapp-share')!.getAttribute('href') || '');
    expect(href).toContain('Pisces');
  });
  it('TC-WISH-EDGE-02: 1900-01-01 (oldest DOB) → no crash', () => {
    renderWish();
    fillNameDob('Old', '1900-01-01');
    expect(() => generate()).not.toThrow();
    expect(q('wish-card')).toBeTruthy();
  });
  it("TC-WISH-EDGE-03: apostrophe in name O'Brien → encoded in URL", () => {
    renderWish();
    fillNameDob("O'Brien", '1985-06-15');
    generate();
    const href = q('wish-whatsapp-share')!.getAttribute('href') || '';
    expect(href).not.toContain("O'Brien"); // encoded
  });
  it('TC-WISH-EDGE-04: very long name → no crash, card still appears', () => {
    renderWish();
    fillNameDob('Ramakrishnaswami Venkatasubramaniam Iyer Pillai', '1985-06-15');
    expect(() => generate()).not.toThrow();
    expect(q('wish-card')).toBeTruthy();
  });
});
