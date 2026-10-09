import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const pub = (f: string) => resolve(__dirname, '../../public', f);

describe('PWA — installable manifest', () => {
  const manifest = JSON.parse(readFileSync(pub('manifest.json'), 'utf8'));

  it('declares standalone display and a scope', () => {
    expect(manifest.display).toBe('standalone');
    expect(manifest.scope).toBe('/');
    expect(typeof manifest.start_url).toBe('string');
  });

  it('ships 192, 512 and a maskable icon that all exist on disk', () => {
    const bySize = Object.fromEntries(manifest.icons.map((i: any) => [`${i.sizes}:${i.purpose}`, i.src]));
    expect(manifest.icons.find((i: any) => i.sizes === '192x192')).toBeTruthy();
    expect(manifest.icons.find((i: any) => i.sizes === '512x512')).toBeTruthy();
    expect(manifest.icons.some((i: any) => (i.purpose || '').includes('maskable'))).toBe(true);
    for (const src of Object.values(bySize) as string[]) {
      expect(existsSync(pub(src.replace(/^\//, '')))).toBe(true);
    }
  });
});

describe('PWA — service worker safety', () => {
  const sw = readFileSync(pub('sw.js'), 'utf8');
  const offline = existsSync(pub('offline.html'));

  it('ships an offline shell', () => {
    expect(offline).toBe(true);
  });

  it('never caches HTML navigations (avoids the stale-shell hazard)', () => {
    // Navigations must be network-first with an /offline fallback, not cache-first.
    expect(sw).toMatch(/request\.mode === 'navigate'/);
    expect(sw).toMatch(/caches\.match\('\/offline'/);
  });

  it('always bypasses /api for the network', () => {
    expect(sw).toMatch(/\/api\//);
  });
});
