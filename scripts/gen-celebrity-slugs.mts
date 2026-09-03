// Generates scripts/celebrity-meta.json = { [slug]: { title, desc } } for all
// Indian celebrities, using the SAME TypeScript utilities the React components use
// (run via tsx). This guarantees the prerendered routes/titles match exactly what
// CelebrityPage renders at runtime — no slug drift, no title mismatch.
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { indianCelebrities } from '../src/data/indianCelebrities';
import {
  generateAllSlugs, parseCelebrityDOB,
  generateCelebrityTitle, generateCelebrityMeta,
} from '../src/utils/celebrityUtils';
import {
  calculateWesternZodiac, calculateVedicRashi,
  calculateChineseZodiac, calculateLifePathNumber,
} from '../src/utils/celebrityCalculations';

const __dirname = dirname(fileURLToPath(import.meta.url));

const slugMap = generateAllSlugs(indianCelebrities as unknown as Record<string, unknown>[]);

const meta: Record<string, { title: string; desc: string }> = {};
slugMap.forEach((celeb, slug) => {
  const name = String(celeb.name || '');
  const dob = parseCelebrityDOB(celeb);
  const isFull = !!dob?.isFullDate;
  const western = isFull ? calculateWesternZodiac(dob!.day, dob!.month) : null;
  const vedic = isFull ? calculateVedicRashi(dob!.day, dob!.month) : null;
  const chinese = dob ? calculateChineseZodiac(dob.year) : null;
  const lifePath = isFull ? calculateLifePathNumber(dob!.day, dob!.month, dob!.year) : null;
  meta[slug] = {
    title: generateCelebrityTitle(name),
    desc: generateCelebrityMeta(name, dob, western?.sign || chinese?.animal || '', vedic?.rashi || '', lifePath),
  };
});

writeFileSync(resolve(__dirname, 'celebrity-meta.json'), JSON.stringify(meta));
console.log('Generated celebrity-meta.json:', Object.keys(meta).length, 'celebrity slugs');
