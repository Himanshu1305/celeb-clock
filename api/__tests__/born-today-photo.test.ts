import { describe, it, expect, vi, afterEach } from 'vitest';
import { GET, isFreeLicense, stripHtml, resolvePhoto } from '../born-today-photo.ts';

describe('born-today-photo (P5-4) — license gate', () => {
  it('accepts recognised free licences', () => {
    expect(isFreeLicense({ LicenseShortName: { value: 'CC BY-SA 4.0' } })).toBe(true);
    expect(isFreeLicense({ LicenseShortName: { value: 'CC BY 2.0' } })).toBe(true);
    expect(isFreeLicense({ LicenseShortName: { value: 'CC0' } })).toBe(true);
    expect(isFreeLicense({ LicenseShortName: { value: 'Public domain' } })).toBe(true);
    expect(isFreeLicense({ License: { value: 'pd' } })).toBe(true);
  });

  it('rejects non-free, fair-use, unknown, and NonFree-flagged licences', () => {
    expect(isFreeLicense({ LicenseShortName: { value: 'Fair use' } })).toBe(false);
    expect(isFreeLicense({ LicenseShortName: { value: 'All rights reserved' } })).toBe(false);
    expect(isFreeLicense({})).toBe(false);
    expect(isFreeLicense({ LicenseShortName: { value: 'CC BY-SA 4.0' }, NonFree: { value: '1' } })).toBe(false);
  });

  it('stripHtml removes markup from the artist field', () => {
    expect(stripHtml('<a href="x">Jane Doe</a>')).toBe('Jane Doe');
    expect(stripHtml('<span>Foo</span>  Bar')).toBe('Foo Bar');
    expect(stripHtml('')).toBe('');
  });
});

describe('born-today-photo (P5-4) — endpoint', () => {
  afterEach(() => vi.restoreAllMocks());

  it('empty name → JSON null, no network', async () => {
    const res = await GET(new Request('https://bornclock.com/api/born-today-photo'));
    const body = await res.json();
    expect(body.image).toBeNull();
  });

  it('rejects non-GET', async () => {
    const res = await GET(new Request('https://bornclock.com/api/born-today-photo?name=x', { method: 'POST' }));
    expect(res.status).toBe(405);
  });

  it('resolves a free image + credit and edge-caches it', async () => {
    const searchResp = { query: { search: [{ title: 'Jane Star' }] } };
    const pageImgResp = { query: { pages: { '1': { thumbnail: { source: 'https://upload.wikimedia.org/jane_500.jpg' }, pageimage: 'Jane.jpg' } } } };
    const extmetadata = {
      LicenseShortName: { value: 'CC BY-SA 4.0' },
      LicenseUrl: { value: 'https://creativecommons.org/licenses/by-sa/4.0' },
      Artist: { value: '<a>Jane Photographer</a>' },
    };
    const infoResp = { query: { pages: { '2': { imageinfo: [{ descriptionurl: 'https://commons.wikimedia.org/wiki/File:Jane.jpg', extmetadata }] } } } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResp)))
      .mockResolvedValueOnce(new Response(JSON.stringify(pageImgResp)))
      .mockResolvedValueOnce(new Response(JSON.stringify(infoResp)));
    vi.stubGlobal('fetch', fetchMock);

    const res = await GET(new Request('https://bornclock.com/api/born-today-photo?name=Jane%20Star'));
    const body = await res.json();
    expect(body.image).toBe('https://upload.wikimedia.org/jane_500.jpg');
    expect(body.credit.artist).toBe('Jane Photographer');
    expect(body.credit.license).toBe('CC BY-SA 4.0');
    expect(body.credit.source).toBe('Wikimedia Commons');
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=604800');
  });

  it('drops a non-free image (returns null, no credit)', async () => {
    const searchResp = { query: { search: [{ title: 'Guarded Celeb' }] } };
    const pageImgResp = { query: { pages: { '1': { thumbnail: { source: 'https://upload.wikimedia.org/x.jpg' }, pageimage: 'X.jpg' } } } };
    const infoResp = { query: { pages: { '2': { imageinfo: [{ extmetadata: { LicenseShortName: { value: 'Fair use' } } }] } } } };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(searchResp)))
      .mockResolvedValueOnce(new Response(JSON.stringify(pageImgResp)))
      .mockResolvedValueOnce(new Response(JSON.stringify(infoResp)));
    vi.stubGlobal('fetch', fetchMock);

    const r = await resolvePhoto('Guarded Celeb');
    expect(r.image).toBeNull();
    expect(r.credit).toBeNull();
  });
});
