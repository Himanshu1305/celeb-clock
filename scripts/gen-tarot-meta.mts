// Batch 7 / W5 — writes src/data/tarotCards/tarotMeta.json ({ route: { title, description } })
// from the SAME TypeScript functions the TarotCardPage uses, so the prerendered <title> and
// meta description always match the page. Run: npx tsx scripts/gen-tarot-meta.mts
// (tarotCards.test.ts fails if the committed JSON is stale).
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { tarotMetaMap } from '../src/data/tarotCards/meta';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = resolve(__dirname, '../src/data/tarotCards/tarotMeta.json');
const map = tarotMetaMap();
writeFileSync(out, JSON.stringify(map, null, 1) + '\n', 'utf-8');
console.log(`[gen-tarot-meta] ${Object.keys(map).length} routes → ${out}`);
