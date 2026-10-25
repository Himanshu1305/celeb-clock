import { describe, it, expect } from 'vitest';
import {
  kootaScoreNote, gunaTotalNote, poruthamCountNote, degreeNote, padaNote, shadbalaNote, dashaPairNote, biorhythmNote,
} from '../numberNotes';

describe('numberNotes — "what this number means for you"', () => {
  it('koota notes: full, zero (with the classical dosha named for Nadi/Bhakoot) and partial', () => {
    expect(kootaScoreNote('yoni', 4, 4)).toMatch(/Full 4 of 4/);
    expect(kootaScoreNote('bhakoot', 0, 7)).toMatch(/0 of 7.*Bhakoot Dosha/);
    expect(kootaScoreNote('bhakoot', 0, 7)).toMatch(/2\/12, 5\/9 or 6\/8/);
    expect(kootaScoreNote('nadi', 0, 8)).toMatch(/Nadi Dosha/);
    expect(kootaScoreNote('tara', 1.5, 3)).toMatch(/reasonable fit/);
    expect(kootaScoreNote('gana', 1, 6)).toMatch(/partial fit/);
  });

  it('Guna total bands are the same as the engine\'s compatibility bands (18 / 24 / 28)', () => {
    // Bands from matchmaking.ts: >=28 Excellent, >=24 Good, >=18 Acceptable, else Challenging.
    expect(gunaTotalNote(28)).toMatch(/excellent/);
    expect(gunaTotalNote(24)).toMatch(/good score/);
    expect(gunaTotalNote(18)).toMatch(/above the traditional pass mark of 18/);
    expect(gunaTotalNote(17.5)).toMatch(/below the traditional pass mark of 18/);
  });

  it('porutham count note', () => {
    expect(poruthamCountNote(7, true)).toMatch(/7 of 10.*Rajju and Dina\) are met/);
    expect(poruthamCountNote(8, false)).toMatch(/essential check .* not met/);
    expect(poruthamCountNote(3)).toMatch(/fewer than half/);
  });

  it('degree note: 30° sign arithmetic, works for in-sign or 0–360 longitudes, flags sign edges', () => {
    // 14°22′ = 14.3667° → middle of the sign (10–20°).
    expect(degreeNote(14 + 22 / 60, 'Your Moon')).toBe('Your Moon is 14° into a 30° sign — in the middle of the sign.');
    expect(degreeNote(30 * 4 + 14.4)).toMatch(/14° into a 30° sign/); // Leo 14.4° as a full longitude
    expect(degreeNote(3)).toMatch(/early in/);
    expect(degreeNote(25)).toMatch(/late in/);
    expect(degreeNote(29.6)).toMatch(/within 1° of a sign boundary/);
    expect(degreeNote(0.4)).toMatch(/within 1° of a sign boundary/);
  });

  it('pada note', () => {
    expect(padaNote(3)).toMatch(/third of the star's four quarters/);
    expect(padaNote(0)).toBe('');
  });

  it('Shadbala note converts virupas → rupas against the BPHS minimum used by strengthScale.ts', () => {
    // Jupiter's classical minimum is 6.5 rupas (390 virupas): exactly 100%.
    expect(shadbalaNote('Jupiter', 390)).toBe('6.50 rupas = 100% of the 6.5 rupas Jupiter classically needs — meets its classical minimum.');
    // Saturn minimum 5 rupas (300 virupas): 450 virupas = 7.50 rupas = 150% → strong (≥125%).
    expect(shadbalaNote('Saturn', 450)).toMatch(/7\.50 rupas = 150% .* clearly strong/);
    // Mercury minimum 7 rupas (420): 336 virupas = 80% → below minimum.
    expect(shadbalaNote('Mercury', 336)).toMatch(/80% .* below its classical minimum/);
    // The brief's example: "1.12 rupas"-style ratio display stays in plain words.
    expect(shadbalaNote('Rahu', 67)).toBe('1.12 rupas (67 virupas).');
  });

  it('dasha pair and biorhythm notes', () => {
    expect(dashaPairNote('Saturn', 'Mercury')).toMatch(/Saturn sets the main theme.*Mercury colours/);
    expect(biorhythmNote(0)).toMatch(/switch-over/);
    expect(biorhythmNote(62)).toMatch(/\+62%/);
    expect(biorhythmNote(-40)).toMatch(/-40%.*pace yourself/);
  });
});
