/**
 * Batch 10 — Bhava Chalit, KP and Jaimini for the Kundali page.
 * Pure, deterministic, computed in the browser from the same engine as /api/kundali
 * (birth instant in UTC + coordinates), so no API/cache change is needed.
 */
import { computeBhavaChalit, type BhavaChalit } from './bhavaChalit';
import { computeKp, type KpTables } from './kp';
import { computeJaimini, type JaiminiResult } from './jaimini';

export interface AdvancedSystems {
  chalit: BhavaChalit | null;
  /** null above the polar circles, where Placidus houses are undefined. */
  kp: KpTables | null;
  jaimini: JaiminiResult;
}

export function computeAdvancedSystems(birthUTC: Date, latitude: number, longitude: number): AdvancedSystems {
  const polar = Math.abs(latitude) > 66;
  return {
    chalit: polar ? null : computeBhavaChalit(birthUTC, latitude, longitude),
    kp: polar ? null : computeKp(birthUTC, latitude, longitude),
    jaimini: computeJaimini(birthUTC, latitude, longitude),
  };
}

export type { BhavaChalit, KpTables, JaiminiResult };
