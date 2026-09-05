import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

describe('Keyword Monitor — TC-MONITOR', () => {
  it('TC-MONITOR-P-01: runs --summary without crashing', () => {
    expect(() => execSync('npx tsx scripts/keyword-monitor.ts --summary', { stdio: 'pipe' })).not.toThrow();
  }, 30000);
  it('TC-MONITOR-P-02: prompts/templates/celebrity.md exists (>100 chars)', () => {
    const md = readFileSync('prompts/templates/celebrity.md', 'utf8');
    expect(md.length).toBeGreaterThan(100);
  });
  it('TC-MONITOR-P-03: prompts/templates/article.md exists', () => {
    expect(existsSync('prompts/templates/article.md')).toBe(true);
  });
  it('TC-MONITOR-P-04: docs/WEEKLY_CHECKLIST.md exists', () => {
    expect(existsSync('docs/WEEKLY_CHECKLIST.md')).toBe(true);
  });
  it('TC-MONITOR-EDGE-01: --from-csv with a missing file exits gracefully', () => {
    let out = '';
    try {
      out = execSync('npx tsx scripts/keyword-monitor.ts --from-csv /nonexistent-xyz.csv', { stdio: 'pipe' }).toString();
    } catch (e: any) {
      out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    }
    expect(out).not.toContain('Cannot read properties of undefined');
    expect(out.toLowerCase()).toContain('not found');
  }, 30000);
});
