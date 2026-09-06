/**
 * Generate real bios for celebrities.json entries lacking one, prioritised by
 * sitelinks (most notable first), via Gemini. Appends to celebrity-bios.json.
 * Run: npx tsx scripts/fill-bios-celebrities.ts [--limit 200]
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const BIOS_PATH = 'src/data/celebrity-bios.json';
const GEMINI_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

interface Celeb { name: string; slug: string; known_for?: string; category?: string; occupation?: string; sitelinks?: number | null; nationality_code?: string; }

function loadBios(): Record<string, string> {
  if (!existsSync(BIOS_PATH)) return {};
  try { return JSON.parse(readFileSync(BIOS_PATH, 'utf8')); } catch { return {}; }
}

function validateBio(bio: string, name: string): string | null {
  if (!bio || bio.trim().length < 100) return 'too short';
  const words = bio.trim().split(/\s+/).length;
  if (words < 100 || words > 260) return `words ${words}`;
  if (/i cannot|as an ai|i'm unable/i.test(bio)) return 'refusal';
  if (bio.includes('[') && bio.includes(']')) return 'template marker';
  const tokens = name.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
  if (tokens.length && !tokens.some(t => bio.toLowerCase().includes(t))) return 'name missing';
  return null;
}

async function generateBio(c: Celeb): Promise<string | null> {
  const nationality = c.nationality_code === 'IN' ? 'Indian' : 'internationally known';
  const ctx = c.known_for || c.occupation || c.category || 'a public figure';
  const prompt = `Write a factual 130-160 word encyclopedic biography of ${c.name}, ${nationality} — known for: ${ctx}. Mention their full name. Plain prose, no markdown, no headings, no bullet points. Be accurate and neutral. Do not refuse.`;
  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) return null;
  const json: any = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

async function main() {
  const li = process.argv.indexOf('--limit');
  const limit = li !== -1 ? parseInt(process.argv[li + 1]) || 200 : 200;
  if (!GEMINI_KEY) { console.log('No GEMINI key — nothing to do.'); return; }

  const celebs: Celeb[] = JSON.parse(readFileSync('src/data/celebrities.json', 'utf8')).celebrities;
  const bios = loadBios();
  const todo = celebs
    .filter(c => c.slug && !bios[c.slug])
    .sort((a, b) => (b.sitelinks ?? 0) - (a.sitelinks ?? 0))
    .slice(0, limit);

  console.log(`Generating up to ${todo.length} bios (${Object.keys(bios).length} existing)…`);
  const { default: pLimit } = await import('p-limit');
  const limiter = pLimit(8);
  let ok = 0, fail = 0;

  await Promise.all(todo.map(c => limiter(async () => {
    try {
      const bio = await generateBio(c);
      if (!bio) { fail++; return; }
      const err = validateBio(bio, c.name);
      if (err) { fail++; return; }
      bios[c.slug] = bio;
      writeFileSync(BIOS_PATH, JSON.stringify(bios, null, 2));
      ok++;
      if (ok % 25 === 0) console.log(`  …${ok} generated`);
    } catch { fail++; }
    await new Promise(r => setTimeout(r, 120));
  })));

  console.log(`\nDone: ${ok} generated, ${fail} failed. Total bios: ${Object.keys(bios).length}`);
}
main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
