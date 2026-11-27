/**
 * B20 — local served-output check: serves dist/ like the worker does and answers
 * /api/kundali-match with the real handler.  npx tsx scripts/b20-local-serve.mts [port]
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { GET as match } from '../api/kundali-match.ts';

const PORT = Number(process.argv[2] ?? 4321);
const DIST = 'dist';
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  if (url.pathname === '/api/kundali-match') {
    const r: Response = await match(new Request(url.toString()));
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  let p = join(DIST, decodeURIComponent(url.pathname));
  if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  else if (!existsSync(p) && existsSync(p + '.html')) p += '.html';
  let status = 200;
  if (!existsSync(p)) { status = url.pathname.startsWith('/api/') || extname(p) ? 404 : 200; p = join(DIST, status === 404 ? '404.html' : 'index.html'); if (!existsSync(p)) p = join(DIST, 'index.html'); }
  res.writeHead(status, { 'content-type': TYPES[extname(p)] ?? 'application/octet-stream' });
  res.end(readFileSync(p));
}).listen(PORT, () => console.log(`[b20-serve] http://localhost:${PORT}`));
