// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import i18n from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { VALID_27_NAKSHATRAS, NAKSHATRA_DEVANAGARI, RASHI_DEVANAGARI } from './testData';
import en from '../../public/locales/en/translation.json';
import hi from '../../public/locales/hi/translation.json';

describe('TC-I18N', () => {
  afterEach(() => cleanup());

  it('TC-I18N-P-01: i18n imports and initialises', () => { expect(i18n).toBeDefined(); expect(i18n.isInitialized).toBe(true); });
  it('TC-I18N-P-02: Hindi has ALL English keys', () => { Object.keys(en).forEach(k => expect((hi as any)[k], `Missing: ${k}`).toBeTruthy()); });
  it('TC-I18N-P-03: Hindi has Devanagari text', () => { const hasDev = Object.values(hi).some((v: any) => /[ऀ-ॿ]/.test(String(v))); expect(hasDev).toBe(true); });
  it('TC-I18N-P-04: nakshatra = नक्षत्र', () => expect((hi as any)['nakshatra']).toContain('नक्षत्र'));
  it('TC-I18N-P-05: rashi = राशि', () => expect((hi as any)['rashi']).toContain('राशि'));
  it('TC-I18N-P-06: kundali = कुंडली', () => expect((hi as any)['kundali']).toContain('कुंडली'));
  it('TC-I18N-P-07: buy_report has 199 not 299', () => { const v = (hi as any)['buy_report']; if (v) { expect(v).toContain('199'); expect(v).not.toContain('299'); } });
  it('TC-I18N-P-08: gift_report has 199 not 299', () => { const v = (hi as any)['gift_report']; if (v) { expect(v).toContain('199'); expect(v).not.toContain('299'); } });
  it('TC-I18N-P-09: LanguageToggle renders EN + Hindi buttons', () => { render(<LanguageToggle />); const btns = document.querySelectorAll('[data-testid="language-toggle"] button'); const text = Array.from(btns).map(b => b.textContent).join(''); expect(text).toMatch(/EN|en/); expect(text).toMatch(/हि|Hindi/i); });
  it('TC-I18N-P-10: all 27 Nakshatra have Devanagari in mapping', () => { VALID_27_NAKSHATRAS.forEach(n => { expect(NAKSHATRA_DEVANAGARI[n], `Missing: ${n}`).toBeTruthy(); expect(NAKSHATRA_DEVANAGARI[n]).toMatch(/[ऀ-ॿ]/); }); });
  it('TC-I18N-P-11: all 12 Rashi have Devanagari', () => { Object.keys(RASHI_DEVANAGARI).forEach(r => expect(RASHI_DEVANAGARI[r]).toMatch(/[ऀ-ॿ]/)); });
  it('TC-I18N-N-01: Hindi no empty string values', () => { Object.entries(hi).forEach(([k, v]) => expect(v, `Empty: ${k}`).not.toBe('')); });
  it('TC-I18N-EDGE-01: switching to Hindi stores in localStorage', () => { render(<LanguageToggle />); const btns = document.querySelectorAll('[data-testid="language-toggle"] button'); const hiBtn = btns[1]; if (hiBtn) { fireEvent.click(hiBtn); expect(localStorage.getItem('i18nextLng')).toMatch(/hi/); } });
});
