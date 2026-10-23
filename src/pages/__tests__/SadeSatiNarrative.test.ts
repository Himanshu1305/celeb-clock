// @vitest-environment jsdom
/**
 * Audit D2/D3/D10: the Sade Sati page text built from the real computed report.
 * Reference dates: Swiss Ephemeris (Lahiri) Saturn ingresses, matching Drik values in
 * round2.txt — Kumbha Moon: pause from 3 Jun 2027, resumes 20 Oct 2027, ends 23 Feb 2028 (IST dates).
 */
import { describe, it, expect } from 'vitest';
import { sadeSatiNarrative, type Report } from '../SadeSatiPage';
import { computeSadeSati } from '@/lib/vedic/sadeSati';
import { getSaturnSignIndex } from '@/lib/vedic/engine/vedicEngine';

const P10_BIRTH = new Date('2024-03-10T03:45:00Z');
const report = (now: string, ageYears: number): Report => ({
  ...computeSadeSati(10, new Date(now), getSaturnSignIndex, P10_BIRTH),
  moonSignName: 'Kumbha', ageYears,
});
const text = (r: Report) => { const n = sadeSatiNarrative(r); return [n.verdict, ...n.body].join(' '); };

describe('Sade Sati narrative (audit D2/D3/D10)', () => {
  it('P10 (child, Kumbha) today: real end date, the pause, no adult career/finance text, no blanks', () => {
    const t = text(report('2026-10-17T06:00:00Z', 2));
    expect(t).toContain('February 2028');
    expect(t).toContain('from 3 June 2027 to 20 October 2027');
    expect(t).toContain('already under way when you were born');
    expect(t).not.toMatch(/financial discipline|career/);
    expect(t).not.toContain('—  ');
    expect(t).not.toMatch(/began\s*—|until\s*—|undefined|NaN/);
  });

  it('Kumbha on 1 Dec 2027 (re-entry) never renders blank dates', () => {
    const t = text(report('2027-12-01T06:00:00Z', 3));
    expect(t).toMatch(/began 20 October 2027 and runs until 23 February 2028/);
    expect(t).not.toMatch(/began\s*—|until\s*—|undefined|NaN/);
  });

  it('Kumbha during the pause says paused and when it resumes', () => {
    const r = report('2027-08-01T06:00:00Z', 3);
    const n = sadeSatiNarrative(r);
    expect(n.verdict).toMatch(/paused/);
    expect(n.body.join(' ')).toContain('20 October 2027');
  });
});
