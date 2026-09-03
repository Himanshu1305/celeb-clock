/**
 * BornClock Celebrity Bio Generator
 * Calls Gemini Flash API in parallel batches to create celebrity biographies.
 * Writes to src/data/celebrity-bios.json (keyed by slug).
 * Bios appear in prerendered HTML for SEO (static JSON import, not Supabase).
 *
 * Usage:
 *   npx tsx scripts/generate-celebrity-bios.ts --batch 1
 *   npx tsx scripts/generate-celebrity-bios.ts --batch 2
 *   npx tsx scripts/generate-celebrity-bios.ts --status
 *   npx tsx scripts/generate-celebrity-bios.ts --slug virat-kohli
 */

// Load env FIRST before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY ?? process.env.GEMINI_API_KEY;
const BIOS_PATH = join(process.cwd(), 'src/data/celebrity-bios.json');
const CELEBS_PATH = join(process.cwd(), 'src/data/indianCelebrities.ts');
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// ── CLI ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
const batchIdx = args.indexOf('--batch');
const batchNum = batchIdx !== -1 ? parseInt(args[batchIdx + 1]) : null;
const isStatus = args.includes('--status');
const slugIdx = args.indexOf('--slug');
const specificSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

// ── SLUG FUNCTION (identical to app) ────────────────────────
function nameToSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[''`]/g, '').replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── DATABASE LOADER ───────────────────────────────────────────
interface CelebEntry { name: string; known_for: string; category: string; birth_place: string; slug: string; }

function loadDatabase(): CelebEntry[] {
  const content = readFileSync(CELEBS_PATH, 'utf8');
  const names      = [...content.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const knownFors  = [...content.matchAll(/known_for:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const categories = [...content.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const places     = [...content.matchAll(/birth_place:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  return names.map((name, i) => ({
    name, known_for: knownFors[i] ?? '', category: categories[i] ?? '',
    birth_place: places[i] ?? 'India', slug: nameToSlug(name),
  }));
}

// ── BIO STORE ─────────────────────────────────────────────────
function loadBios(): Record<string, string> {
  if (!existsSync(BIOS_PATH)) return {};
  try { return JSON.parse(readFileSync(BIOS_PATH, 'utf8')); } catch { return {}; }
}
function saveBios(bios: Record<string, string>): void {
  writeFileSync(BIOS_PATH, JSON.stringify(bios, null, 2), 'utf8');
}

// ── VALIDATION ────────────────────────────────────────────────
function validateBio(bio: string, name: string): string | null {
  if (!bio || bio.trim().length < 50) return 'Too short (<50 chars)';
  if (bio.includes('I cannot') || bio.includes('I am an AI') || bio.includes('As an AI'))
    return 'Contains AI refusal language';
  if (bio.includes('[') && bio.includes(']')) return 'Contains template markers';
  const words = bio.trim().split(/\s+/).length;
  if (words < 100) return `Too short (${words} words, need ≥100)`;
  if (words > 260) return `Too long (${words} words, need ≤260)`;
  // Name check: pass if any meaningful name token (≥3 chars) appears in the bio.
  // Guards against false-negatives for initial-led names (e.g. "MS Dhoni", "PV Sindhu").
  const lowerBio = bio.toLowerCase();
  const nameTokens = name.toLowerCase().split(/\s+/).filter(t => t.length >= 3);
  const checkTokens = nameTokens.length > 0 ? nameTokens : [name.split(' ')[0].toLowerCase()];
  if (!checkTokens.some(t => lowerBio.includes(t)))
    return `Bio doesn't mention name "${name}"`;
  return null;
}

// ── GEMINI API ────────────────────────────────────────────────
async function callGemini(celeb: CelebEntry): Promise<string | null> {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY not found in .env.local');

  const prompt = `Write a factual, engaging biography of ${celeb.name}, an Indian ${celeb.category || 'public figure'} known for ${celeb.known_for || 'significant contributions to Indian culture'}.${celeb.birth_place && celeb.birth_place !== 'India' ? ` Born in ${celeb.birth_place}.` : ''}

Requirements:
- Length: 150-180 words exactly
- Start with their full name and most important achievement
- Cover early life briefly (1-2 sentences)
- Cover 3-4 specific career achievements with context
- Cover cultural significance or lasting legacy (1-2 sentences)
- Third person, present tense for ongoing, past tense for completed
- Only publicly verifiable well-known facts
- No net worth estimates
- End with one sentence on their enduring cultural impact

Return ONLY the biography. No headings, labels, or commentary.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 8192, topP: 0.8, thinkingConfig: { thinkingBudget: 0 } },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',  threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',  threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 150)}`);

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

async function generateBio(celeb: CelebEntry, attempt = 1): Promise<string | null> {
  try {
    const bio = await callGemini(celeb);
    if (!bio) return null;

    const err = validateBio(bio, celeb.name);
    if (err) {
      if (attempt < 2) {
        console.log(`    ↩️  Retry for ${celeb.name} (${err})`);
        await sleep(1500);
        return generateBio(celeb, attempt + 1);
      }
      console.log(`    ⚠️  Validation failed after 2 attempts for ${celeb.name}: ${err}`);
      return null;
    }
    return bio;
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'RATE_LIMITED' && attempt < 3) {
      console.log(`    ⏳ Rate limited — waiting 60s then retry ${attempt + 1}/3`);
      await sleep(60000);
      return generateBio(celeb, attempt + 1);
    }
    throw e;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── BATCH LISTS ───────────────────────────────────────────────
// Names must match (or fuzzy-match) entries in indianCelebrities.ts
// Script warns for any name not found in DB
const BATCH_1 = [
  'Virat Kohli','Sachin Tendulkar','Shah Rukh Khan','Amitabh Bachchan',
  'A.R. Rahman','Narendra Modi','Priyanka Chopra','MS Dhoni',
  'Rohit Sharma','Deepika Padukone','Ranveer Singh','Aamir Khan',
  'Salman Khan','Ranbir Kapoor','Aishwarya Rai','Akshay Kumar',
  'Hrithik Roshan','Katrina Kaif','Anushka Sharma','Kareena Kapoor',
  'Ratan Tata','Mukesh Ambani','Lata Mangeshkar','Kishore Kumar',
  'Rajinikanth','Kamal Haasan','Prabhas','Mahesh Babu',
  'Allu Arjun','Jr NTR','Yuvraj Singh','Saina Nehwal',
  'PV Sindhu','Mary Kom','Neeraj Chopra','Sourav Ganguly',
  'Kapil Dev','Sunil Gavaskar','Rekha','Madhuri Dixit',
  'Kajol','Nawazuddin Siddiqui','Irrfan Khan','Naseeruddin Shah',
  'Shabana Azmi','Javed Akhtar','Gulzar','Zakir Hussain',
  'Viswanathan Anand','Bismillah Khan',
];
const BATCH_2 = [
  'Arijit Singh','Shreya Ghoshal','Sonu Nigam','Kumar Sanu',
  'Asha Bhosle','Udit Narayan','Alka Yagnik','Sunidhi Chauhan',
  'Hardik Pandya','Jasprit Bumrah','KL Rahul','Shubman Gill',
  'Smriti Mandhana','Mithali Raj','Harmanpreet Kaur','Jhulan Goswami',
  'Abhinav Bindra','Leander Paes','Sania Mirza','Pullela Gopichand',
  'Milkha Singh','PT Usha','Bhaichung Bhutia','Sunil Chhetri',
  'Rani Rampal','Bajrang Punia','Vinesh Phogat','Geeta Phogat',
  'Sakshi Malik','Hima Das','Manika Batra','Pankaj Advani',
  'Koneru Humpy','Taapsee Pannu','Alia Bhatt','Shraddha Kapoor',
  'Kangana Ranaut','Vidya Balan','Ayushmann Khurrana','Rajkummar Rao',
  'Vicky Kaushal','Manoj Bajpayee','Pankaj Tripathi','Tabu',
  'Tiger Shroff','Varun Dhawan','Kartik Aaryan','Saif Ali Khan',
  'John Abraham','Emraan Hashmi',
];
const BATCH_3 = [
  'Raj Kapoor','Dev Anand','Dilip Kumar','Dharmendra',
  'Rajesh Khanna','Guru Dutt','Meena Kumari','Nargis',
  'Smita Patil','Jeetendra','Mithun Chakraborty','Jackie Shroff',
  'Anil Kapoor','Sunny Deol','Sanjay Dutt','Dimple Kapadia',
  'Zeenat Aman','Hema Malini','Jaya Bachchan','Sharmila Tagore',
  'Asha Parekh','Mumtaz','Waheeda Rehman','Supriya Pathak',
  'Konkona Sen Sharma','Swara Bhaskar','Richa Chadha','Radhika Apte',
  'Bhumi Pednekar','Sara Ali Khan','Janhvi Kapoor','Ananya Panday',
  'Kriti Sanon','Kiara Advani','Disha Patani','Parineeti Chopra',
  'Sonakshi Sinha','Bipasha Basu','Shilpa Shetty','Urmila Matondkar',
  'Tabu','Kajol','Rani Mukerji','Preity Zinta',
  'Kareena Kapoor','Karisma Kapoor','Juhi Chawla','Raveena Tandon',
  'Twinkle Khanna','Manisha Koirala',
];

const PREDEFINED_BATCHES = [BATCH_1, BATCH_2, BATCH_3];

// ── STATUS ────────────────────────────────────────────────────
function showStatus() {
  const db = loadDatabase();
  const bios = loadBios();
  const done = Object.keys(bios).length;
  const pct = db.length > 0 ? Math.round((done / db.length) * 100) : 0;

  console.log('\n══════════════════════════════════════');
  console.log('  BornClock Celebrity Bio Status');
  console.log('══════════════════════════════════════');
  console.log(`  Database:   ${db.length} celebrities`);
  console.log(`  Generated:  ${done} bios (${pct}%)`);
  console.log(`  Remaining:  ${db.length - done}`);
  console.log('══════════════════════════════════════');

  if (done > 0) {
    const sample = Object.entries(bios).slice(0, 2);
    console.log('\nSample:');
    sample.forEach(([slug, bio]) => {
      console.log(`  [${slug}] ${bio.split(/\s+/).length} words`);
      console.log(`  ${bio.slice(0, 100)}...\n`);
    });
  }
}

// ── PROCESS BATCH ─────────────────────────────────────────────
async function processBatch(names: string[]) {
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(8); // 8 concurrent Gemini calls

  const db = loadDatabase();
  const bios = loadBios();
  const dbBySlug = new Map(db.map(c => [c.slug, c]));
  const dbByName = new Map(db.map(c => [c.name.toLowerCase(), c]));

  // Match names — try exact slug, then lowercase name match
  const toProcess: CelebEntry[] = [];
  for (const name of names) {
    const slug = nameToSlug(name);
    const found = dbBySlug.get(slug) ?? dbByName.get(name.toLowerCase());
    if (!found) {
      console.log(`  ⚠️  Not found in DB: "${name}" (slug: ${slug})`);
      continue;
    }
    if (bios[found.slug]) {
      console.log(`  ✓  Already done: ${found.name}`);
      continue;
    }
    toProcess.push(found);
  }

  if (toProcess.length === 0) {
    console.log('\n  All celebrities in this batch already have bios.\n');
    return;
  }

  console.log(`\n  Processing ${toProcess.length} celebrities (8 parallel)...\n`);
  let ok = 0, fail = 0, invalid = 0;

  await Promise.all(toProcess.map(celeb =>
    limit(async () => {
      try {
        const bio = await generateBio(celeb);
        if (!bio) { fail++; console.log(`  ❌  ${celeb.name} — empty response`); return; }
        const err = validateBio(bio, celeb.name);
        if (err) { invalid++; console.log(`  ⚠️  ${celeb.name} — ${err}`); return; }
        bios[celeb.slug] = bio;
        saveBios(bios); // Save after each success
        console.log(`  ✅  ${celeb.name} (${bio.split(/\s+/).length} words)`);
        ok++;
      } catch (e) {
        fail++;
        console.log(`  ❌  ${celeb.name} — ${(e as Error).message}`);
      }
      await sleep(150);
    })
  ));

  console.log('\n══════════════════════════════════════');
  console.log(`  ✅ Success:  ${ok}`);
  console.log(`  ⚠️  Invalid: ${invalid}`);
  console.log(`  ❌ Failed:  ${fail}`);
  console.log(`  📄 Total bios now: ${Object.keys(bios).length}`);
  console.log('══════════════════════════════════════\n');
}

// ── UPDATE SINGLE ─────────────────────────────────────────────
async function updateSingle(slug: string) {
  const db = loadDatabase();
  const bios = loadBios();
  const celeb = db.find(c => c.slug === slug);
  if (!celeb) { console.log(`\n  ❌ No celebrity with slug "${slug}"\n`); return; }

  console.log(`\n  Regenerating: ${celeb.name}...`);
  try {
    const bio = await generateBio(celeb);
    if (!bio) { console.log('  ❌ Empty response\n'); return; }
    const err = validateBio(bio, celeb.name);
    if (err) { console.log(`  ⚠️  Validation: ${err}\n${bio}\n`); return; }
    bios[slug] = bio;
    saveBios(bios);
    console.log(`  ✅ Done (${bio.split(/\s+/).length} words)\n\n${bio}\n`);
  } catch (e) { console.log(`  ❌ ${(e as Error).message}\n`); }
}

// ── AUTO BATCHES (beyond predefined 3) ───────────────────────
function getAutoBatch(batchNum: number): string[] {
  const db = loadDatabase();
  const bios = loadBios();
  const predefinedSlugs = new Set(PREDEFINED_BATCHES.flat().map(nameToSlug));
  const remaining = db
    .filter(c => !bios[c.slug] && !predefinedSlugs.has(c.slug))
    .map(c => c.name);
  const offset = (batchNum - PREDEFINED_BATCHES.length - 1) * 50;
  return remaining.slice(offset, offset + 50);
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🎬  BornClock Celebrity Bio Generator (Gemini Flash)\n');

  if (isStatus) { showStatus(); return; }

  if (specificSlug) { await updateSingle(specificSlug); return; }

  if (!batchNum) {
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --batch 1    # Top 50');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --batch 2    # Next 50');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --status     # Progress');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --slug virat-kohli');
    return;
  }

  let names: string[];
  if (batchNum <= PREDEFINED_BATCHES.length) {
    names = PREDEFINED_BATCHES[batchNum - 1];
    console.log(`  Running predefined Batch ${batchNum} (${names.length} celebrities)`);
  } else {
    names = getAutoBatch(batchNum);
    if (names.length === 0) {
      console.log('  No remaining celebrities for this batch. Run --status to check.\n');
      return;
    }
    console.log(`  Running auto-batch ${batchNum} (${names.length} remaining celebrities)`);
  }

  await processBatch(names);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
