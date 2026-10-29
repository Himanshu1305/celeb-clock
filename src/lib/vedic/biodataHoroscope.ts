/**
 * Horoscope details for the marriage biodata (Batch 10) — computed IN THE BROWSER with the
 * same Lahiri engine behind /kundali (generateFullChart) and the one shared Manglik rule
 * (assessManglik, src/lib/vedic/manglik.ts: Mars from Lagna and Moon in houses 1, 4, 7, 8,
 * 12; both = High, one = Low). Nothing is sent to a server.
 */
import { generateFullChart } from './engine/vedicEngine';
import { assessManglik } from './manglik';
import { RASHIS } from './rashifal';
import { NAKSHATRA_HINDI } from '@/data/vedicTermsHindi';

export interface BiodataHoroscope {
  rashi: string;
  nakshatra: string;
  lagna: string;
  manglik: string;
  /** Raw facts, for tests / display notes. */
  facts: { moonSignIndex: number; lagnaSignIndex: number; nakshatra: string; pada: number; manglikLevel: 'None' | 'Low' | 'High'; cancelled: boolean };
}

const HI_PADA = 'चरण';

export function biodataHoroscope(birthUtc: Date, lat: number, lon: number, lang: 'en' | 'hi' = 'en'): BiodataHoroscope {
  const c = generateFullChart(birthUtc, birthUtc, lat, lon);
  const moon = c.planets.Moon, mars = c.planets.Mars;
  const lagnaIdx = c.lagna.rashiIndex as number;
  const m = assessManglik({
    lagnaSignIndex: lagnaIdx, moonSignIndex: moon.rashiIndex, marsSignIndex: mars.rashiIndex,
    jupiterSignIndex: c.planets.Jupiter.rashiIndex, venusSignIndex: c.planets.Venus.rashiIndex,
  });
  const rm = RASHIS[moon.rashiIndex], lm = RASHIS[lagnaIdx];
  const nak = moon.nakshatra as string, pada = moon.pada as number;
  const en = lang === 'en';
  const rashi = en ? `${rm.sanskrit} (${rm.english})` : rm.hindi;
  const lagna = en ? `${lm.sanskrit} (${lm.english})` : lm.hindi;
  const nakshatra = en ? `${nak}, pada ${pada}` : `${NAKSHATRA_HINDI[nak] ?? nak}, ${HI_PADA} ${pada}`;
  const manglik = m.level === 'None'
    ? (en ? 'No' : 'नहीं')
    : en
      ? `Yes — ${m.level === 'High' ? 'from both Lagna and Moon' : `from the ${m.fromLagna.present ? 'Lagna' : 'Moon'} only (partial)`}${m.cancelled ? '; classical cancellation applies' : ''}`
      : `हाँ — ${m.level === 'High' ? 'लग्न और चंद्र दोनों से' : `केवल ${m.fromLagna.present ? 'लग्न' : 'चंद्र'} से (आंशिक)`}${m.cancelled ? '; शास्त्रीय परिहार लागू' : ''}`;
  return {
    rashi, nakshatra, lagna, manglik,
    facts: { moonSignIndex: moon.rashiIndex, lagnaSignIndex: lagnaIdx, nakshatra: nak, pada, manglikLevel: m.level, cancelled: m.cancelled },
  };
}
