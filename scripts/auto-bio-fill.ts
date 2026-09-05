/**
 * Nightly bio auto-fill (Tasks 9 & 12).
 *
 * Generates up to BATCH_LIMIT (default 50) missing celebrity bios per run using
 * Gemini, appending to src/data/celebrity-bios.json. Designed to run unattended
 * from GitHub Actions (see .github/workflows/deploy.yml). Exits cleanly — never
 * throws — when there is no work or no GEMINI_API_KEY, so a scheduled run is a
 * safe no-op rather than a failed job.
 *
 * Run:  npx tsx scripts/auto-bio-fill.ts [--limit 50]
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CELEBS_PATH = 'src/data/indianCelebrities.ts';
const BIOS_PATH = 'src/data/celebrity-bios.json';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const nameToSlug = (name: string): string =>
  name.toLowerCase().replace(/['’‘`´]/g, '').replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-')
    .replace(/-+/g, '-').replace(/^-|-$/g, '');

interface Celeb { name: string; known_for: string; category: string; slug: string; }

export function loadCelebrities(): Celeb[] {
  if (!existsSync(CELEBS_PATH)) return [];
  const src = readFileSync(CELEBS_PATH, 'utf8');
  const names = [...src.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const knownFors = [...src.matchAll(/known_for:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const categories = [...src.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  return names.map((name, i) => ({
    name, known_for: knownFors[i] ?? '', category: categories[i] ?? '', slug: nameToSlug(name),
  }));
}

export function loadBios(): Record<string, string> {
  if (!existsSync(BIOS_PATH)) return {};
  try { return JSON.parse(readFileSync(BIOS_PATH, 'utf8')); } catch { return {}; }
}

export function missingBios(limit: number): Celeb[] {
  const bios = loadBios();
  return loadCelebrities().filter(c => !bios[c.slug]).slice(0, limit);
}

function validateBio(bio: string, name: string): string | null {
  if (!bio || bio.trim().length < 100) return 'too short';
  const words = bio.trim().split(/\s+/).length;
  if (words < 100 || words > 260) return `word count ${words}`;
  if (/i cannot|as an ai/i.test(bio)) return 'refusal';
  const tokens = name.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
  if (tokens.length && !tokens.some(t => bio.toLowerCase().includes(t))) return 'name missing';
  return null;
}

async function generateBio(celeb: Celeb, key: string): Promise<string | null> {
  const prompt = `Write a factual 130-160 word encyclopedic biography of ${celeb.name}, an Indian ${celeb.category} known for: ${celeb.known_for}. Mention their name. No markdown, no headings, plain prose. Do not refuse.`;
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) return null;
  const json: any = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

export async function run(limit: number): Promise<{ generated: number; skipped: number }> {
  const key = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const todo = missingBios(limit);
  if (todo.length === 0) {
    console.log('✅ No missing bios — nothing to do.');
    return { generated: 0, skipped: 0 };
  }
  if (!key) {
    console.log(`⚠️  ${todo.length} bios missing but GEMINI_API_KEY is not set — skipping (no-op).`);
    return { generated: 0, skipped: todo.length };
  }
  console.log(`Generating up to ${todo.length} bios…`);
  const bios = loadBios();
  let generated = 0;
  for (const celeb of todo) {
    try {
      const bio = await generateBio(celeb, key);
      if (!bio) { console.log(`  ❌ ${celeb.name} — empty`); continue; }
      const err = validateBio(bio, celeb.name);
      if (err) { console.log(`  ⚠️  ${celeb.name} — ${err}`); continue; }
      bios[celeb.slug] = bio;
      writeFileSync(BIOS_PATH, JSON.stringify(bios, null, 2));
      generated++;
      console.log(`  ✅ ${celeb.name}`);
    } catch (e) {
      console.log(`  ❌ ${celeb.name} — ${(e as Error).message}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }
  console.log(`\nDone: ${generated} generated, ${bios ? Object.keys(bios).length : 0} total.`);
  return { generated, skipped: todo.length - generated };
}

// Run only when invoked directly.
const invokedDirectly = process.argv[1] && process.argv[1].includes('auto-bio-fill');
if (invokedDirectly) {
  const li = process.argv.indexOf('--limit');
  const limit = li !== -1 ? parseInt(process.argv[li + 1]) || 50 : 50;
  run(limit).catch(e => { console.error('Fatal:', e.message); process.exit(1); });
}
