import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

describe('GitHub Actions + Automation — TC-CICD', () => {
  const yaml = readFileSync('.github/workflows/deploy.yml', 'utf8');

  it('TC-CICD-P-01: deploy.yml has the expected trigger + action structure', () => {
    expect(yaml).toContain('push:');
    expect(yaml).toContain('schedule:');
    expect(yaml).toContain('cron:');
    expect(yaml).toContain('workflow_dispatch:');
    expect(yaml).toContain('wrangler-action');
  });
  it('TC-CICD-P-02: all secrets use ${{ secrets.X }}, none hardcoded', () => {
    expect(yaml).not.toMatch(/eyJ[A-Za-z0-9+/=]{20,}/); // base64 JWT
    expect(yaml).not.toMatch(/sk_live_[A-Za-z0-9]+/);   // stripe-style
    expect(yaml).toContain('${{ secrets.CF_API_TOKEN }}');
  });
  it('TC-CICD-P-03: GITHUB_ACTIONS_SETUP.md documents required secrets', () => {
    const md = readFileSync('GITHUB_ACTIONS_SETUP.md', 'utf8');
    expect(md).toContain('CF_API_TOKEN');
    expect(md).toContain('SUPABASE');
    expect(md).toContain('GEMINI');
  });
  it('TC-CICD-N-01: no hardcoded Supabase URL in the workflow', () => {
    expect(yaml).not.toContain('supabase.co/');
  });
});
