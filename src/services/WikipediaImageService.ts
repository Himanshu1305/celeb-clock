// Wikipedia Image Service - Fetches celebrity / born-today photos.
//
// P5-4: resolution now goes through BornClock's edge endpoint
// (/api/born-today-photo), which (a) returns ONLY freely-licensed images and
// (b) returns the photo credit (author + licence), both edge-cached for a week.
// We still keep a 7-day localStorage cache and a direct-Wikipedia fallback for
// local dev where the worker route isn't present. The returned value stays a
// URL string (backward compatible); the credit is stored alongside and read via
// getImageCredit(name) so the UI can show the required attribution.

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const PHOTO_ENDPOINT = '/api/born-today-photo';
const IMAGE_CACHE_KEY = 'wiki_images_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ImageCredit {
  artist: string | null;
  license: string | null;
  licenseUrl: string | null;
  fileUrl: string | null;
  source: string;
}

interface ImageCache {
  [name: string]: {
    url: string | null;
    timestamp: number;
    credit?: ImageCredit | null;
  };
}

// Get cached images from localStorage
const getImageCache = (): ImageCache => {
  try {
    const cached = localStorage.getItem(IMAGE_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
};

// Save image cache to localStorage
const saveImageCache = (cache: ImageCache): void => {
  try {
    localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage errors
  }
};

/** Read the stored photo credit (author + licence) for a name, if resolved. */
export const getImageCredit = (name: string): ImageCredit | null => {
  const cached = getImageCache()[name];
  return cached?.credit ?? null;
};

// Resolve a free-licensed photo + credit via BornClock's edge endpoint.
// Returns null (and caches the null) if no freely-licensed image exists.
const fetchViaEndpoint = async (name: string): Promise<{ url: string | null; credit: ImageCredit | null } | null> => {
  try {
    const res = await fetch(`${PHOTO_ENDPOINT}?name=${encodeURIComponent(name)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data?.image === 'undefined') return null;
    return { url: data.image ?? null, credit: data.credit ?? null };
  } catch {
    return null;
  }
};

// Fetch a person's photo (free-licensed) + credit, cached for 7 days.
export const fetchWikipediaImage = async (name: string): Promise<string | null> => {
  // Check cache first
  const cache = getImageCache();
  const cached = cache[name];

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  // Preferred path: BornClock's edge endpoint (free-only, credited, edge-cached).
  const viaEndpoint = await fetchViaEndpoint(name);
  if (viaEndpoint) {
    cache[name] = { url: viaEndpoint.url, credit: viaEndpoint.credit, timestamp: Date.now() };
    saveImageCache(cache);
    return viaEndpoint.url;
  }

  // Fallback (local dev without the worker): direct Wikipedia, no licence check.
  try {
    const searchUrl = `${WIKIPEDIA_API}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(name)}&srlimit=1`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const pageTitle = searchData.query?.search?.[0]?.title;
    if (!pageTitle) {
      cache[name] = { url: null, timestamp: Date.now() };
      saveImageCache(cache);
      return null;
    }

    const imageUrl = `${WIKIPEDIA_API}?action=query&format=json&origin=*&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=500&pilicense=any`;
    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.json();

    const pages = imageData.query?.pages;
    const pageId = Object.keys(pages || {})[0];
    const thumbnail = pages?.[pageId]?.thumbnail?.source;

    cache[name] = { url: thumbnail || null, timestamp: Date.now() };
    saveImageCache(cache);

    return thumbnail || null;
  } catch (error) {
    console.error(`Failed to fetch image for ${name}:`, error);
    return null;
  }
};

// Batch fetch images for multiple people
export const fetchMultipleWikipediaImages = async (
  names: string[],
  onProgress?: (loaded: number, total: number) => void
): Promise<Map<string, string | null>> => {
  const results = new Map<string, string | null>();
  const cache = getImageCache();
  
  // First pass: get cached results
  const uncachedNames: string[] = [];
  for (const name of names) {
    const cached = cache[name];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results.set(name, cached.url);
    } else {
      uncachedNames.push(name);
    }
  }

  // Second pass: fetch uncached images with rate limiting
  let loaded = names.length - uncachedNames.length;
  onProgress?.(loaded, names.length);

  for (const name of uncachedNames) {
    try {
      const imageUrl = await fetchWikipediaImage(name);
      results.set(name, imageUrl);
    } catch {
      results.set(name, null);
    }
    loaded++;
    onProgress?.(loaded, names.length);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

// Try to get image from Wikidata Commons (higher quality)
export const fetchWikidataImage = async (name: string): Promise<string | null> => {
  try {
    const query = `
      SELECT ?image WHERE {
        ?person rdfs:label "${name}"@en .
        ?person wdt:P18 ?image .
      }
      LIMIT 1
    `;
    
    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    const imageUrl = data.results?.bindings?.[0]?.image?.value;
    return imageUrl || null;
  } catch {
    return null;
  }
};

// Combined fetch: try Wikidata first, then Wikipedia
export const fetchCelebrityImage = async (
  name: string,
  existingImage?: string
): Promise<string | null> => {
  // If already has a valid image URL, return it
  if (existingImage && existingImage.startsWith('http')) {
    return existingImage;
  }

  // Check cache
  const cache = getImageCache();
  const cached = cache[name];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  // Try Wikipedia API (more reliable and faster)
  const wikipediaImage = await fetchWikipediaImage(name);
  if (wikipediaImage) {
    return wikipediaImage;
  }

  return null;
};

export default {
  fetchWikipediaImage,
  fetchMultipleWikipediaImages,
  fetchWikidataImage,
  fetchCelebrityImage,
};
