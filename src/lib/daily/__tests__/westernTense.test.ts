import { describe, it, expect } from 'vitest';
import { composeWestern, westernSky } from '../kinds/westernDaily';

// Reviewer finding (batch 7): a station a few days before the page date read "turns direct on …".
describe('Western daily: event wording follows the page date', () => {
  it('never uses future tense for an event dated before the page date', () => {
    for (const date of ['2026-11-15', '2027-03-20', '2027-06-10']) {
      const sky = westernSky(date);
      for (let s = 0; s < 12; s++) {
        const text = JSON.stringify(composeWestern(date, s, sky));
        for (const e of sky.events) {
          if (e.date < date) {
            expect(text).not.toMatch(new RegExp(`${e.body} (turns|enters|re-enters) `));
          }
        }
      }
    }
  });
});
