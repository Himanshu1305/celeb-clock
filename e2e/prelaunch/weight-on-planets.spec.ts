/**
 * Suite — weight-on-planets.spec.ts  (BATCH-7B P10, T2 edge/negative cases)
 * Pure-logic over src/lib/planetGravity.ts — validation, unit conversion, and one
 * planet result checked against its cited NASA gravity ratio. No browser/servers.
 */
import { test, expect } from '@playwright/test';
import {
  PLANETS, weightOn, kgToLb, lbToKg, isValidWeight, displayWeight,
} from '../../src/lib/planetGravity';

test('all 8 planets + the Moon are present with sane gravity ratios', () => {
  expect(PLANETS).toHaveLength(9);
  const keys = PLANETS.map(p => p.key);
  for (const k of ['mercury', 'venus', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune']) {
    expect(keys).toContain(k);
  }
  // Jupiter is the heaviest (>2×), the Moon the lightest (<0.2×).
  expect(PLANETS.find(p => p.key === 'jupiter')!.gravity).toBeGreaterThan(2);
  expect(PLANETS.find(p => p.key === 'moon')!.gravity).toBeLessThan(0.2);
});

test('T2: invalid inputs (0, negative, absurd, NaN, empty) fail validation cleanly', () => {
  expect(isValidWeight(0)).toBe(false);
  expect(isValidWeight(-5)).toBe(false);
  expect(isValidWeight(10000)).toBe(false);        // absurd
  expect(isValidWeight(NaN)).toBe(false);          // empty input → parseFloat('') = NaN
  expect(isValidWeight(parseFloat(''))).toBe(false);
  expect(isValidWeight(Infinity)).toBe(false);
  // displayWeight never renders NaN
  expect(displayWeight(NaN)).toBe('—');
});

test('T2: valid inputs (including decimals) pass validation', () => {
  expect(isValidWeight(70)).toBe(true);
  expect(isValidWeight(70.5)).toBe(true);          // decimal
  expect(isValidWeight(0.5)).toBe(true);
  expect(isValidWeight(2000)).toBe(true);
});

test('T2: kg↔lb round-trips — 70 kg ↔ 154.3 lb', () => {
  expect(Math.round(kgToLb(70) * 10) / 10).toBe(154.3);
  expect(Math.round(lbToKg(154.3) * 10) / 10).toBeCloseTo(70, 0);
});

test('T2: Mars result matches the cited ratio — 70 kg × 0.379 = 26.5 kg', () => {
  const mars = PLANETS.find(p => p.key === 'mars')!;
  expect(mars.gravity).toBe(0.379);
  expect(weightOn(70, mars.gravity)).toBeCloseTo(26.53, 1);
  expect(displayWeight(weightOn(70, mars.gravity))).toBe('26.5');
});

test('decimal input computes without NaN', () => {
  const jupiter = PLANETS.find(p => p.key === 'jupiter')!;
  const r = weightOn(70.5, jupiter.gravity);
  expect(Number.isFinite(r)).toBe(true);
  expect(displayWeight(r)).not.toBe('—');
});
