/** B20 — pure helpers shared by the muhurat engine and the pages (no astronomy imports). */
export interface City { id: string; en: string; hi: string; lat: number; lon: number }
export const CITIES: readonly City[] = [
  { id: 'new-delhi', en: 'New Delhi', hi: 'नई दिल्ली', lat: 28.6139, lon: 77.2090 },
  { id: 'mumbai', en: 'Mumbai', hi: 'मुंबई', lat: 19.0760, lon: 72.8777 },
  { id: 'kolkata', en: 'Kolkata', hi: 'कोलकाता', lat: 22.5726, lon: 88.3639 },
  { id: 'chennai', en: 'Chennai', hi: 'चेन्नई', lat: 13.0827, lon: 80.2707 },
  { id: 'bengaluru', en: 'Bengaluru', hi: 'बेंगलुरु', lat: 12.9716, lon: 77.5946 },
  { id: 'hyderabad', en: 'Hyderabad', hi: 'हैदराबाद', lat: 17.3850, lon: 78.4867 },
  { id: 'ahmedabad', en: 'Ahmedabad', hi: 'अहमदाबाद', lat: 23.0225, lon: 72.5714 },
  { id: 'pune', en: 'Pune', hi: 'पुणे', lat: 18.5204, lon: 73.8567 },
  { id: 'jaipur', en: 'Jaipur', hi: 'जयपुर', lat: 26.9124, lon: 75.7873 },
  { id: 'lucknow', en: 'Lucknow', hi: 'लखनऊ', lat: 26.8467, lon: 80.9462 },
];
export type Win = [number, number];
const IST_H = 5.5;

/** "18:36" IST */
export const hm = (ms: number) => new Date(ms + IST_H * 3600_000).toISOString().slice(11, 16);
export const istDate = (ms: number) => new Date(ms + IST_H * 3600_000).toISOString().slice(0, 10);

/** RFC 5545 calendar file with one event (times in UTC). */
export function icsEvent(o: { uid: string; title: string; start: number; end: number; description: string; url: string }): string {
  const f = (ms: number) => new Date(Math.round(ms / 60_000) * 60_000).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = (s: string) => s.replace(/[\\;,]/g, m => `\\${m}`).replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BornClock//Festivals 2027//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${o.uid}@bornclock.com`, `DTSTAMP:${f(Date.UTC(2026, 10, 27))}`, `DTSTART:${f(o.start)}`, `DTEND:${f(o.end)}`,
    `SUMMARY:${esc(o.title)}`, `DESCRIPTION:${esc(o.description)}`, `URL:${o.url}`, 'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}

