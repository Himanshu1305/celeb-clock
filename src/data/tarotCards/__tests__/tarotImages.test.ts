import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import IMAGES from '../images.json';
import { TAROT_CARD_SLUGS } from '../index';

// Batch 8: card images are the 1909 RWS scans, each checked "Public domain" on Commons
// by scripts/fetch-tarot-images.mjs.
describe('tarot card images', () => {
  const imgs = IMAGES as Record<string, { src: string; licence: string; commonsPage: string; width: number; height: number }>;
  it('has one public-domain image per card, and the file exists', () => {
    expect(Object.keys(imgs).sort()).toEqual([...TAROT_CARD_SLUGS].sort());
    for (const slug of TAROT_CARD_SLUGS) {
      const i = imgs[slug];
      expect(i.licence).toBe('Public domain');
      expect(i.commonsPage).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:RWS1909_-_/);
      expect(i.width).toBeGreaterThan(0);
      expect(existsSync(resolve(__dirname, '../../../../public', i.src.replace(/^\//, '')))).toBe(true);
    }
  });
});
