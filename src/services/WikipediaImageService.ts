// Wikipedia Image Service - Fetches celebrity photos from Wikipedia
// Uses the Wikipedia API to get images for people

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';
const IMAGE_CACHE_KEY = 'wiki_images_cache';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ImageCache {
  [name: string]: {
    url: string | null;
    timestamp: number;
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

// Fetch Wikipedia page image for a person
export const fetchWikipediaImage = async (name: string): Promise<string | null> => {
  // Check cache first
  const cache = getImageCache();
  const cached = cache[name];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  try {
    // First, search for the Wikipedia page
    const searchUrl = `${WIKIPEDIA_API}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(name)}&srlimit=1`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    const pageTitle = searchData.query?.search?.[0]?.title;
    if (!pageTitle) {
      cache[name] = { url: null, timestamp: Date.now() };
      saveImageCache(cache);
      return null;
    }

    // Fetch the page image (thumbnail)
    const imageUrl = `${WIKIPEDIA_API}?action=query&format=json&origin=*&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=200&pilicense=any`;
    const imageResponse = await fetch(imageUrl);
    const imageData = await imageResponse.json();
    
    const pages = imageData.query?.pages;
    const pageId = Object.keys(pages || {})[0];
    const thumbnail = pages?.[pageId]?.thumbnail?.source;

    // Cache the result
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
