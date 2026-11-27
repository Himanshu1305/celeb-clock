// Shared by export-ml-review / import-ml-review: flattens every user-visible Malayalam string.
import ml from '../src/lib/lang/copy/ml';
import vocab from '../src/lib/lang/vocab/ml.js';

export interface MlString { id: string; group: string; text: string; context: string }
const SAMPLE: Record<string, unknown[]> = {};
const hasMl = (s: string) => /[ഀ-ൿ]/.test(s);
function groupOf(path: string): string {
  if (/^copy\.(kundali|kundaliText|south)/.test(path)) return path.includes('south') || path.includes('kundaliText') ? 'Matching' : 'Kundali';
  if (/^copy\.(rashifal|year|year2027|remedies)/.test(path)) return 'Rashifal';
  if (/^copy\.panchang|^vocab\.(tithis|yogas|karanas|varas|paksha|panchang)/i.test(path)) return 'Panchang';
  return 'Common';
}
function context(path: string): string {
  const last = path.split('.').pop() ?? '';
  if (/^\d+$/.test(last)) { const parent = path.split('.').slice(-2, -1)[0]; return `${parent} item`; }
  if (/\.q$/.test(path)) return 'FAQ question';
  if (/\.a$/.test(path)) return 'FAQ answer';
  if (/title|heading|h1/i.test(last)) return 'heading';
  if (/lead|intro|body|para/i.test(path)) return 'paragraph';
  if (/toggle|button|cta|calc/i.test(last)) return 'button / control';
  return last;
}
function walk(v: unknown, path: string, out: MlString[], depth = 0): void {
  if (depth > 8 || v == null) return;
  if (typeof v === 'string') { if (hasMl(v)) out.push({ id: path, group: groupOf(path), text: v, context: context(path) }); return; }
  if (typeof v === 'function') {
    // Render templates with neutral sample arguments so the reviewer sees the full sentence.
    const n = v.length; const args = SAMPLE[path] ?? Array.from({ length: n }, (_, i) => (i === 0 ? '{1}' : i === 1 ? '{2}' : `{${i + 1}}`));
    try { const r = (v as (...a: unknown[]) => unknown)(...args); if (typeof r === 'string' && hasMl(r)) out.push({ id: `${path}()`, group: groupOf(path), text: r, context: 'template ({1}, {2} … are filled in on the page)' }); } catch { /* skip */ }
    return;
  }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}.${i}`, out, depth + 1)); return; }
  if (typeof v === 'object') for (const [k, x] of Object.entries(v as Record<string, unknown>)) walk(x, `${path}.${k}`, out, depth + 1);
}
export function mlStrings(): MlString[] {
  const out: MlString[] = [];
  walk(ml, 'copy', out); walk(vocab, 'vocab', out);
  const seen = new Set<string>();
  return out.filter(s => (seen.has(s.id) ? false : (seen.add(s.id), true)));
}
