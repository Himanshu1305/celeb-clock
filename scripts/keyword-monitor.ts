/**
 * Keyword monitor (Task 11).
 *
 * Lightweight helper for the weekly SEO routine. Reads a Google Search Console
 * performance CSV export and surfaces opportunity keywords (high impressions,
 * low CTR / position 5-20). Never throws on bad input — prints a friendly
 * message and exits.
 *
 *   npx tsx scripts/keyword-monitor.ts --summary
 *   npx tsx scripts/keyword-monitor.ts --from-csv path/to/Queries.csv
 */
import { readFileSync, existsSync } from 'fs';

const args = process.argv.slice(2);

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
}

function fromCsv(file: string) {
  if (!file) {
    console.log('⚠️  --from-csv requires a file path. Usage: --from-csv path/to/Queries.csv');
    process.exit(0);
  }
  if (!existsSync(file)) {
    console.log(`⚠️  CSV not found: ${file} — nothing to analyse. Export one from Search Console → Performance → Export.`);
    process.exit(0);
  }
  let rows: Record<string, string>[] = [];
  try {
    rows = parseCsv(readFileSync(file, 'utf8'));
  } catch (e) {
    console.log(`⚠️  Could not read CSV: ${(e as Error).message}`);
    process.exit(0);
  }
  if (rows.length === 0) {
    console.log('⚠️  CSV had no data rows.');
    process.exit(0);
  }
  const num = (v: string | undefined) => {
    const n = parseFloat(String(v ?? '').replace(/[%,]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };
  const opps = rows
    .map(r => ({
      query: r['query'] || r['top queries'] || r['keyword'] || '(unknown)',
      impressions: num(r['impressions']),
      ctr: num(r['ctr']),
      position: num(r['position']),
    }))
    .filter(r => r.impressions >= 50 && r.position >= 5 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 25);

  console.log(`\n🔎 ${opps.length} opportunity keywords (impressions ≥ 50, position 5-20):\n`);
  opps.forEach(o =>
    console.log(`  ${o.query}  —  ${o.impressions} impr, pos ${o.position.toFixed(1)}, CTR ${o.ctr.toFixed(1)}%`)
  );
  console.log('\nTip: write/expand content for these using prompts/templates/*.md.\n');
}

function summary() {
  console.log('📊 BornClock keyword monitor');
  console.log('  Commands:');
  console.log('    --summary               Show this help + weekly routine');
  console.log('    --from-csv <file>       Analyse a Search Console Queries CSV');
  console.log('');
  console.log('  Weekly routine (see docs/WEEKLY_CHECKLIST.md):');
  console.log('    1. Export Search Console → Performance → Queries → CSV');
  console.log('    2. Run: npx tsx scripts/keyword-monitor.ts --from-csv <file>');
  console.log('    3. Pick 3-5 opportunity keywords');
  console.log('    4. Draft content with prompts/templates/celebrity.md or article.md');
}

const csvIdx = args.indexOf('--from-csv');
if (csvIdx !== -1) {
  fromCsv(args[csvIdx + 1]);
} else {
  // Default and --summary both show the summary.
  summary();
}
