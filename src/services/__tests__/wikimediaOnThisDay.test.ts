import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { fetchOnThisDay, WIKIMEDIA_ATTRIBUTION } from '@/services/wikimediaOnThisDay';

// Minimal localStorage shim for the node/test env.
function installLocalStorage() {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: () => null,
    length: 0,
  } as Storage;
}

const sampleItem = (year: number, title: string) => ({
  text: `Something happened involving ${title}`,
  year,
  pages: [{
    title,
    normalizedtitle: title,
    extract: 'An extract.',
    content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${title}` } },
    thumbnail: { source: 'https://example.org/thumb.jpg' },
  }],
});

describe('P4-BIRTHDAY-EVENTS wikimedia on-this-day service', () => {
  beforeEach(() => installLocalStorage());
  afterEach(() => vi.restoreAllMocks());

  it('TC-OTD-01: attribution is CC BY-SA 4.0 with a Wikipedia source link', () => {
    expect(WIKIMEDIA_ATTRIBUTION.licenseName).toBe('CC BY-SA 4.0');
    expect(WIKIMEDIA_ATTRIBUTION.licenseUrl).toContain('creativecommons.org');
    expect(WIKIMEDIA_ATTRIBUTION.sourceUrl).toContain('wikipedia.org');
  });

  it('TC-OTD-02: maps + sorts (desc by year) + caps events/births/deaths', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const kind = url.includes('/events/') ? 'events' : url.includes('/births/') ? 'births' : 'deaths';
      return {
        ok: true,
        json: async () => ({ [kind]: [sampleItem(1900, 'A'), sampleItem(2001, 'B'), sampleItem(1950, 'C')] }),
      };
    });
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);

    const data = await fetchOnThisDay(5, 13, 2);
    expect(data.failed).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // Capped to 2, sorted most-recent-first.
    expect(data.events.map(e => e.year)).toEqual([2001, 1950]);
    expect(data.events[0].pageUrl).toContain('wikipedia.org');
    expect(data.deaths).toHaveLength(2);
  });

  it('TC-OTD-03: network failure degrades to empty + failed, never throws', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch);
    const data = await fetchOnThisDay(5, 13);
    expect(data.failed).toBe(true);
    expect(data.events).toEqual([]);
    expect(data.births).toEqual([]);
    expect(data.deaths).toEqual([]);
  });

  it('TC-OTD-04: invalid date returns failed without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock as unknown as typeof fetch);
    const data = await fetchOnThisDay(13, 40);
    expect(data.failed).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
