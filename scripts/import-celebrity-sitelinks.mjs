// scripts/import-celebrity-sitelinks.mjs
// Run once with: node scripts/import-celebrity-sitelinks.mjs
// Dataset: https://huggingface.co/datasets/jeggers/celebrity-dates
// License: CC BY 4.0

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jwrpqiypvystivtqyhro.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: Set SUPABASE_SERVICE_ROLE_KEY environment variable');
  console.error('Get it from: Supabase Dashboard → Project Settings → API → service_role');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Nationality code mapping for common countries
// Wikidata uses full country names, we map to ISO codes
const NATIONALITY_TO_CODE = {
  'United States': 'US',
  'United States of America': 'US',
  'American': 'US',
  'United Kingdom': 'GB',
  'British': 'GB',
  'England': 'GB',
  'India': 'IN',
  'Indian': 'IN',
  'France': 'FR',
  'French': 'FR',
  'Germany': 'DE',
  'German': 'DE',
  'Australia': 'AU',
  'Australian': 'AU',
  'Canada': 'CA',
  'Canadian': 'CA',
  'Italy': 'IT',
  'Italian': 'IT',
  'Spain': 'ES',
  'Spanish': 'ES',
  'Brazil': 'BR',
  'Brazilian': 'BR',
  'Japan': 'JP',
  'Japanese': 'JP',
  'China': 'CN',
  'Chinese': 'CN',
  'Russia': 'RU',
  'Russian': 'RU',
  'Mexico': 'MX',
  'Mexican': 'MX',
  'Argentina': 'AR',
  'Argentine': 'AR',
  'Pakistan': 'PK',
  'Pakistani': 'PK',
  'Nigeria': 'NG',
  'Nigerian': 'NG',
  'South Africa': 'ZA',
  'South African': 'ZA',
};

function toISO(nationality) {
  if (!nationality) return null;
  return NATIONALITY_TO_CODE[nationality] || null;
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

async function downloadAndParseDataset() {
  console.log('Downloading dataset from Hugging Face...');

  const csvUrl = 'https://huggingface.co/datasets/jeggers/celebrity-dates/resolve/main/data/train-00000-of-00001.csv';

  try {
    const response = await fetch(csvUrl, {
      headers: { 'User-Agent': 'celeb-clock-import/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return parseCSV(text);
  } catch (err) {
    console.log('CSV download failed, trying Hugging Face API...');
    return await fetchViaAPI();
  }
}

function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log('CSV headers:', headers);

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle quoted fields with commas inside
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const record = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] || null;
    });
    records.push(record);
  }

  console.log(`Parsed ${records.length} records from CSV`);
  return records;
}

async function fetchViaAPI() {
  // Hugging Face datasets API - returns rows in JSON format
  const apiUrl = 'https://datasets-server.huggingface.co/rows?dataset=jeggers%2Fcelebrity-dates&config=default&split=train&offset=0&length=100';

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`API failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`API returned ${data.rows?.length} sample rows`);
  console.log('Sample row:', JSON.stringify(data.rows?.[0], null, 2));

  return data.rows?.map(r => r.row) || [];
}

function transformRecord(raw) {
  // Handle different possible column names from the dataset
  const name = raw.personLabel || raw.name || raw.label || null;
  const birthDate = raw.dateOfBirth || raw.birth_date || raw.born || null;
  const deathDate = raw.dateOfDeath || raw.death_date || raw.died || null;
  const sitelinks = parseInt(raw.sitelinks || raw.site_links || '0') || 0;
  const nationality = raw.nationalityLabel || raw.nationality || raw.country || null;
  const occupation = raw.occupationLabel || raw.occupation || null;
  const wikidataId = raw.person || raw.wikidata_id || null;

  if (!name || !birthDate) return null;

  const birthMonthDay = toBirthMonthDay(birthDate);
  if (!birthMonthDay) return null;

  // Extract wikidata ID from full URL if needed
  const cleanWikidataId = wikidataId
    ? wikidataId.replace('http://www.wikidata.org/entity/', '')
    : null;

  return {
    name: name.trim(),
    birth_date: birthDate || null,
    birth_month_day: birthMonthDay,
    death_date: deathDate || null,
    sitelinks,
    nationality: nationality || null,
    nationality_code: toISO(nationality),
    occupation: occupation || null,
    wikidata_id: cleanWikidataId,
    wikipedia_url: cleanWikidataId
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, '_'))}`
      : null,
  };
}

async function insertBatch(records, batchNum, total) {
  const { error } = await supabase
    .from('celebrity_sitelinks')
    .upsert(records, { onConflict: 'name,birth_date' });

  if (error) {
    console.error(`Batch ${batchNum} error:`, error.message);
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

  if (existing > 0) {
    console.log('Table already has data. To reimport, manually truncate: TRUNCATE celebrity_sitelinks;');
    console.log('Exiting to avoid duplicates.');
    process.exit(0);
  }

  // Download dataset
  let rawRecords;
  try {
    rawRecords = await downloadAndParseDataset();
  } catch (err) {
    console.error('Download failed:', err.message);
    console.log('');
    console.log('Manual option: Download from https://huggingface.co/datasets/jeggers/celebrity-dates');
    console.log('Save as scripts/celebrity-dates.csv and re-run with LOCAL_FILE=true');
    process.exit(1);
  }

  if (!rawRecords || rawRecords.length === 0) {
    console.error('No records downloaded');
    process.exit(1);
  }

  console.log(`Downloaded ${rawRecords.length} raw records`);
  console.log('Sample raw record:', JSON.stringify(rawRecords[0], null, 2));

  // Transform records
  const transformed = rawRecords
    .map(transformRecord)
    .filter(Boolean);

  console.log(`Transformed ${transformed.length} valid records`);
  console.log('Sample transformed:', JSON.stringify(transformed[0], null, 2));

  // Show nationality distribution
  const nationalityCounts = {};
  transformed.forEach(r => {
    const nat = r.nationality_code || 'Unknown';
    nationalityCounts[nat] = (nationalityCounts[nat] || 0) + 1;
  });
  const top10 = Object.entries(nationalityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  console.log('Top nationalities:', top10);

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

  // Test query
  const { data: test } = await supabase
    .from('celebrity_sitelinks')
    .select('name, birth_month_day, sitelinks, nationality')
    .eq('birth_month_day', '05-13')
    .order('sitelinks', { ascending: false })
    .limit(5);

  console.log('Test query (May 13 birthdays, ranked by sitelinks):');
  console.log(JSON.stringify(test, null, 2));
}

main().catch(console.error);
