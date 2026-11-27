/**
 * B20 — precomputes the Holi / Diwali 2027 muhurats into src/lib/year2027/muhurat2027.data.json
 * so the pages don't run ~1.7 s of rising-sign search in the visitor's browser.
 *   npx tsx scripts/gen-muhurat2027.mts
 * muhurat2027.test.tsx fails if this file ever differs from the live calculation.
 */
import { writeFileSync } from 'node:fs';
import { serialiseMuhurat2027 } from '../src/lib/year2027/muhurat2027';
writeFileSync('src/lib/year2027/muhurat2027.data.json', JSON.stringify(serialiseMuhurat2027(), null, 1) + '\n');
console.log('[muhurat2027] written');
