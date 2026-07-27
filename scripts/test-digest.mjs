// One-off: send a single weekly-digest TEST email to ADMIN_EMAIL, mirroring
// api/weekly-digest.ts (same celeb query + Resend call) with real credentials.
// Run: node --env-file=.env.local scripts/test-digest.mjs
import { createClient } from '@supabase/supabase-js';

const FROM = 'BornClock <hello@bornclock.com>';
const to = process.env.ADMIN_EMAIL || 'himanshu1305@gmail.com';
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) { console.error('RESEND_API_KEY missing'); process.exit(1); }

const MMDD = d => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = new Date();
const dob = new Date('1990-06-25T12:00:00');
const days = Math.floor((today - dob) / 86400000);
const bio = p => Math.round(Math.sin((2 * Math.PI * days) / p) * 100);

let global = [], india = [];
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return MMDD(d); });
const q = () => sb.from('celebrity_sitelinks').select('name, birth_date, occupation, nationality_code, sitelinks').in('birth_month_day', week).not('birth_date', 'is', null).order('sitelinks', { ascending: false });
try {
  const [g, i] = await Promise.all([q().limit(3), q().eq('nationality_code', 'IN').limit(3)]);
  global = g.data ?? []; india = i.data ?? [];
} catch (e) { console.error('celeb query:', e.message); }

const row = c => `<li><strong>${c.name}</strong>${c.birth_date ? ` (b. ${new Date(c.birth_date).getFullYear()})` : ''}${c.occupation ? ` — ${c.occupation}` : ''}</li>`;
const html = `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#103A5C">BornClock — weekly reading (TEST)</h2>
  <p><strong>Days to birthday:</strong> ${(() => { const n = new Date(today.getFullYear(), dob.getMonth(), dob.getDate()); if (n < today) n.setFullYear(today.getFullYear() + 1); return Math.round((n - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000); })()}</p>
  <p><strong>Biorhythm:</strong> physical ${bio(23)}%, emotional ${bio(28)}%, intellectual ${bio(33)}%</p>
  <p><strong>Celebrities this week:</strong></p><ul>${global.map(row).join('') || '<li>(none)</li>'}</ul>
  <p><strong>From India 🇮🇳:</strong></p><ul>${india.map(row).join('') || '<li>(none)</li>'}</ul>
  <p style="font-size:11px;color:#999">Unsubscribe: https://bornclock.com/api/unsubscribe?token=sample</p>
</div>`;

const resp = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: FROM, to: [to], subject: 'BornClock weekly reading — TEST', html }),
});
const data = await resp.json().catch(() => ({}));
console.log('status:', resp.status, '| to:', to, '| celebs global/IN:', global.length + '/' + india.length, '| resend id:', data.id || JSON.stringify(data));
