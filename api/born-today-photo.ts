// Born-today / celebrity photo resolver — "cached through BornClock" (P5-4).
//
// What it does, and why each part matters for the P5-4 requirements:
//  • "freely licensed images only": it reads the file's license metadata from
//    Wikimedia (imageinfo extmetadata) and returns a photo ONLY when a free
//    licence is positively identified (CC-BY / CC-BY-SA / CC0 / public domain /
//    no-restrictions). Non-free / fair-use / unknown-licence images are dropped.
//  • "credits shown": it returns the author/artist, licence name + URL and the
//    Commons file page, so the UI can display the attribution the licence
//    requires (see getImageCredit in WikipediaImageService + the credit lines in
//    the celebrity dialog and born-today sections).
//  • "cached through BornClock" + "periodic refresh": the response carries an
//    edge Cache-Control (s-maxage = 7 days), so repeat lookups are served from
//    the Cloudflare edge and refresh weekly rather than hammering Wikimedia.
//    `?img=1` additionally streams the image BYTES through this worker with the
//    same edge cache, so the photo itself can be served from bornclock.com.
//
// Best-effort and non-throwing: any failure yields { image: null } (JSON) or a
// 404 (image mode) so callers degrade to an initials avatar.

const WP_API = 'https://en.wikipedia.org/w/api.php';

interface Credit { artist: string | null; license: string | null; licenseUrl: string | null; fileUrl: string | null; source: 'Wikimedia Commons'; }
interface PhotoResult { name: string; image: string | null; credit: Credit | null; }

function json(body: unknown, status = 200, sMaxAge = 0): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  headers['Cache-Control'] = status === 200 && sMaxAge > 0
    ? `public, max-age=86400, s-maxage=${sMaxAge}`
    : 'no-store';
  return new Response(JSON.stringify(body), { status, headers });
}

const stripHtml = (s: string): string =>
  (s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || '';

// Positively recognise a FREE licence; anything else is treated as not reusable.
function isFreeLicense(meta: Record<string, any>): boolean {
  if (!meta) return false;
  if (String(meta.NonFree?.value ?? '') === '1') return false;
  const name = String(meta.LicenseShortName?.value || meta.License?.value || '').toLowerCase();
  if (!name) return false;
  if (/non-?free|fair use|all rights reserved|copyright(ed)?$/.test(name)) return false;
  return /\bcc[\s-]?(by|0|zero)|cc-by|creative commons|public domain|\bpd\b|pdm|no restrictions|government/.test(name);
}

async function wpJson(url: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(url, { headers: { 'User-Agent': 'BornClock/1.0 (+https://bornclock.com; born-today photos)' }, signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

/** Resolve a free, credited lead photo for a person name. Null if none is free. */
async function resolvePhoto(name: string): Promise<PhotoResult> {
  const empty: PhotoResult = { name, image: null, credit: null };

  // 1) Find the best-matching article title.
  const search = await wpJson(`${WP_API}?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(name)}&srlimit=1`);
  const title: string | undefined = search?.query?.search?.[0]?.title;
  if (!title) return empty;

  // 2) Lead image: thumbnail URL + the Commons file name.
  const pageImg = await wpJson(`${WP_API}?action=query&format=json&origin=*&titles=${encodeURIComponent(title)}&prop=pageimages&piprop=name|thumbnail&pithumbsize=500`);
  const pages = pageImg?.query?.pages || {};
  const page = pages[Object.keys(pages)[0] || ''];
  const thumb: string | undefined = page?.thumbnail?.source;
  const fileName: string | undefined = page?.pageimage;
  if (!thumb || !fileName) return empty;

  // 3) Licence + author metadata for the file.
  const info = await wpJson(`${WP_API}?action=query&format=json&origin=*&titles=${encodeURIComponent('File:' + fileName)}&prop=imageinfo&iiprop=extmetadata|url&iiextmetadatafilter=License|LicenseShortName|LicenseUrl|Artist|Credit|NonFree`);
  const ipages = info?.query?.pages || {};
  const ipage = ipages[Object.keys(ipages)[0] || ''];
  const ii = ipage?.imageinfo?.[0];
  const meta = ii?.extmetadata || {};

  if (!isFreeLicense(meta)) return empty; // free-licensed images only

  const credit: Credit = {
    artist: stripHtml(meta.Artist?.value || '') || null,
    license: stripHtml(meta.LicenseShortName?.value || meta.License?.value || '') || null,
    licenseUrl: meta.LicenseUrl?.value || null,
    fileUrl: ii?.descriptionurl || null,
    source: 'Wikimedia Commons',
  };
  return { name, image: thumb, credit };
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const { searchParams } = new URL(request.url, 'http://localhost');
  const name = (searchParams.get('name') || '').trim();
  const wantBytes = searchParams.get('img') === '1';
  if (!name) return wantBytes ? new Response('missing name', { status: 400 }) : json({ name: '', image: null, credit: null });

  const result = await resolvePhoto(name);

  // Image-bytes mode: stream the free, resolved photo THROUGH the worker with a
  // 7-day edge cache, so the photo is genuinely served (and cached) via bornclock.com.
  if (wantBytes) {
    if (!result.image) return new Response('no free image', { status: 404, headers: { 'Cache-Control': 'public, max-age=3600' } });
    try {
      const imgRes = await fetch(result.image, { headers: { 'User-Agent': 'BornClock/1.0 (+https://bornclock.com)' } });
      if (!imgRes.ok) return new Response('upstream error', { status: 502 });
      const headers = new Headers();
      headers.set('Content-Type', imgRes.headers.get('Content-Type') || 'image/jpeg');
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      // Credit travels in a header too, for completeness (UI uses the JSON path).
      if (result.credit?.license) headers.set('X-Image-License', result.credit.license);
      if (result.credit?.artist) headers.set('X-Image-Author', result.credit.artist.slice(0, 120));
      return new Response(imgRes.body, { status: 200, headers });
    } catch {
      return new Response('fetch failed', { status: 502 });
    }
  }

  // JSON mode: resolved free image + credit, edge-cached 7 days (periodic refresh).
  return json(result, 200, result.image ? 604800 : 0);
}

export const GET = handler;
export { resolvePhoto, isFreeLicense, stripHtml };
