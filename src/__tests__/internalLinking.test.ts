import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('Internal Linking Sweep + Share — TC-LINK', () => {
  it('TC-LINK-P-01: born-on (global) links to /wish and /compatibility', () => {
    const src = readFileSync('src/pages/BornOnDay.tsx', 'utf8');
    expect(src).toContain('to="/wish"');
    expect(src).toContain('to="/compatibility"');
  });
  it('TC-LINK-P-02: born-on (India) links to /wish and /compatibility', () => {
    const src = readFileSync('src/pages/BornOnDayIndia.tsx', 'utf8');
    expect(src).toContain('to="/wish"');
    expect(src).toContain('to="/compatibility"');
  });
  it('TC-LINK-P-03: celebrity page links to /compatibility', () => {
    const src = readFileSync('src/pages/CelebrityPage.tsx', 'utf8');
    expect(src).toContain('to="/compatibility"');
  });
  it('TC-LINK-P-04: birthday report includes ShareMyProfileButton', () => {
    const src = readFileSync('src/pages/BirthdayReport.tsx', 'utf8');
    expect(src).toContain('ShareMyProfileButton');
  });
});
