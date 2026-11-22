import { describe, it, expect } from 'vitest';
import worker from '../../functions/_worker';
import { GET } from '../varshphal';

// B18: /api/varshphal (free Varshphal) + Worker route validation for the two tool pages.
const env = {
  ASSETS: { fetch: async () => new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } }) },
};
const page = (path: string) => worker.fetch(new Request(`https://bornclock.com${path}`), env as never, {});
const api = (qs: string) => GET(new Request(`https://bornclock.com/api/varshphal?${qs}`));
const JAMMU = 'y=1978&m=5&d=13&h=19&min=30&lat=32.7266&lon=74.857&tzid=Asia/Kolkata';

describe('Worker — Varshphal pages', () => {
  it.each(['/varshphal/', '/hi/varshphal/'])('%s → 200', async (p) => {
    expect((await page(p)).status).toBe(200);
  });
  it.each(['/varshphal/2027/', '/hi/varshphal/foo', '/varshphal/a/b/'])('%s → 404', async (p) => {
    expect((await page(p)).status).toBe(404);
  });
  it('the API route is registered', async () => {
    const res = await page(`/api/varshphal?${JAMMU}&year=2027`);
    expect(res.status).toBe(200);
  });
});

describe('/api/varshphal', () => {
  it('returns the annual chart, outlook and the birth zone (Jammu 1978, 2027)', async () => {
    const res = await api(`${JAMMU}&year=2027`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.result.year).toBe(2027);
    expect(body.result.completedYears).toBe(49);
    expect(body.result.varshaPravesh.localDate).toMatch(/^2027-05-1[3-5]$/);
    expect(body.result.varshaPravesh.timezone).toBe('Asia/Kolkata');
    expect(body.outlook.blocks).toHaveLength(5);
    expect(body.castFor).toBe('birth');
    expect(body.birthTimezone.utcOffsetHours).toBe(5.5);
  });
  it('casts for the current residence when given (same moment, different Lagna/zone)', async () => {
    const a = await (await api(`${JAMMU}&year=2027`)).json();
    const b = await (await api(`${JAMMU}&year=2027&rlat=40.7128&rlon=-74.006`)).json();
    expect(b.castFor).toBe('residence');
    expect(b.result.varshaPravesh.utc).toBe(a.result.varshaPravesh.utc);
    expect(b.result.varshaPravesh.timezone).toBe('America/New_York');
    expect(b.result.varshaPravesh.offset).toBe('UTC−04:00'); // May → EDT
  });
  it('Hindi outlook', async () => {
    const body = await (await api(`${JAMMU}&year=2026&lang=hi`)).json();
    expect(body.lang).toBe('hi');
    expect(body.outlook.headline).toMatch(/वर्षफल/);
  });
  it.each([
    ['year before birth', `${JAMMU}&year=1978`],
    ['year missing', JAMMU],
    ['bad month', 'y=1978&m=13&d=1&year=2027'],
    ['bad residence', `${JAMMU}&year=2027&rlat=99&rlon=0`],
  ])('%s → 400', async (_n, qs) => {
    expect((await api(qs)).status).toBe(400);
  });
});
