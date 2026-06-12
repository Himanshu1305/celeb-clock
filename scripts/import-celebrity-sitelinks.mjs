// scripts/import-celebrity-sitelinks.mjs
// Run once with: node scripts/import-celebrity-sitelinks.mjs
// Dataset: https://huggingface.co/datasets/jeggers/celebrity-dates
// License: CC BY 4.0

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCAL_JSON = join(__dirname, 'celebrity-dates.json');

const SUPABASE_URL = 'https://jwrpqiypvystivtqyhro.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Get it from: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function stripTime(dateStr) {
  if (!dateStr) return null;
  // "1950-05-13T00:00:00Z" → "1950-05-13"
  return dateStr.split('T')[0] || null;
}

function toBirthMonthDay(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${month}-${day}`;
  } catch {
    return null;
  }
}

function loadDataset() {
  if (!existsSync(LOCAL_JSON)) {
    throw new Error(
      `Local file not found: ${LOCAL_JSON}\n` +
      'Download the dataset from https://huggingface.co/datasets/jeggers/celebrity-dates\n' +
      'and save it as scripts/celebrity-dates.json'
    );
  }

  console.log(`Reading local file: ${LOCAL_JSON}`);
  const raw = JSON.parse(readFileSync(LOCAL_JSON, 'utf8'));

  // Handle three possible JSON shapes:
  //   1. Plain array:            [{...}, ...]
  //   2. HuggingFace data key:   { "data": [{...}, ...] }
  //   3. HuggingFace rows key:   { "rows": [{...}, ...] }
  let records;
  if (Array.isArray(raw)) {
    records = raw;
  } else if (Array.isArray(raw.data)) {
    records = raw.data;
  } else if (Array.isArray(raw.rows)) {
    records = raw.rows;
  } else {
    throw new Error('Unrecognised JSON structure — expected array, { data: [...] }, or { rows: [...] }');
  }

  console.log(`Loaded ${records.length} records from local file`);
  console.log('First record:', JSON.stringify(records[0], null, 2));
  return records;
}

function transformRecord(raw) {
  const name = raw.personLabel || null;
  let birth_date = stripTime(raw.dateOfBirth);
  let death_date = stripTime(raw.dateOfDeath) || null;
  const sitelinks = typeof raw.sitelinks === 'number'
    ? raw.sitelinks
    : parseInt(raw.sitelinks, 10) || 0;

  if (!name || !birth_date) return null;

  // Filter out corrupted date strings (e.g. "t3182110974")
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(birth_date)) return null;
  if (death_date && !dateRegex.test(death_date)) {
    death_date = null; // death date corrupted — keep record but null the death date
  }

  // Filter out ancient/historical figures with dates before year 1000
  const birthYear = parseInt(birth_date.substring(0, 4));
  if (birthYear < 1000) return null;

  // Validate month and day ranges
  const [, month, day] = birth_date.split('-').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const birthMonthDay = toBirthMonthDay(birth_date);
  if (!birthMonthDay) return null;

  return {
    name: name.trim(),
    birth_date,
    birth_month_day: birthMonthDay,
    death_date,
    sitelinks,
    nationality: null,
    nationality_code: null,
    occupation: null,
    wikidata_id: null,
    wikipedia_url: null,
  };
}

async function insertBatch(records, batchNum, total) {
  const { error } = await supabase
    .from('celebrity_sitelinks')
    .insert(records);

  if (error) {
    console.error(`Batch ${batchNum} error:`, JSON.stringify(error, null, 2));
    console.error('First record in batch:', JSON.stringify(records[0], null, 2));
    return false;
  }

  console.log(`Batch ${batchNum} inserted (${records.length} records, ${Math.round(batchNum * records.length / total * 100)}% done)`);
  return true;
}

async function main() {
  console.log('=== Celebrity Sitelinks Import ===');
  console.log('Source: jeggers/celebrity-dates (Hugging Face)');
  console.log('Target: Supabase celebrity_sitelinks table');
  console.log('');

  // Check existing count
  const { count: existing } = await supabase
    .from('celebrity_sitelinks')
    .select('*', { count: 'exact', head: true });

  console.log(`Existing records in table: ${existing || 0}`);

  // Load dataset from local file
  let rawRecords;
  try {
    rawRecords = loadDataset();
  } catch (err) {
    console.error('Failed to load dataset:', err.message);
    process.exit(1);
  }

  if (!rawRecords || rawRecords.length === 0) {
    console.error('No records found in dataset file');
    process.exit(1);
  }

  console.log(`Total records loaded from JSON: ${rawRecords.length}`);

  // Transform records
  const transformed = rawRecords
    .map(transformRecord)
    .filter(Boolean);

  const skipped = rawRecords.length - transformed.length;
  console.log(`Transformed ${transformed.length} valid records (${skipped} skipped — invalid dates or missing data)`);
  console.log('Sample transformed:', JSON.stringify(transformed[0], null, 2));

  // Show sitelinks distribution
  const highFame = transformed.filter(r => r.sitelinks >= 100).length;
  const medFame = transformed.filter(r => r.sitelinks >= 50 && r.sitelinks < 100).length;
  const lowFame = transformed.filter(r => r.sitelinks < 50).length;
  console.log(`Sitelinks: ${highFame} high (100+), ${medFame} medium (50-99), ${lowFame} lower (31-49)`);

  // Insert in batches of 500
  const BATCH_SIZE = 500;
  const batches = [];
  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    batches.push(transformed.slice(i, i + BATCH_SIZE));
  }

  console.log(`Inserting ${batches.length} batches of ${BATCH_SIZE}...`);

  let success = 0;
  let failed = 0;
  for (let i = 0; i < batches.length; i++) {
    const ok = await insertBatch(batches[i], i + 1, transformed.length);
    if (ok) success++;
    else failed++;

    // Small delay to avoid rate limits
    if (i < batches.length - 1) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  // Verify final count
  const { count: final } = await supabase
    .from('celebrity_sitelinks')
    .select('*', { count: 'exact', head: true });

  console.log('');
  console.log('=== Import Complete ===');
  console.log(`Batches: ${success} success, ${failed} failed`);
  console.log(`Final record count: ${final}`);
  console.log('');

  // Test query — top 10 for May 13 by sitelinks
  const { data: test } = await supabase
    .from('celebrity_sitelinks')
    .select('name, birth_month_day, sitelinks')
    .eq('birth_month_day', '05-13')
    .order('sitelinks', { ascending: false })
    .limit(10);

  console.log('Test query (May 13 birthdays, top 10 by sitelinks):');
  console.log(JSON.stringify(test, null, 2));
}

main().catch(console.error);
