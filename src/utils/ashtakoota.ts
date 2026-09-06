/**
 * Ashtakoota (Guna Milan) — the 36-point Vedic marriage-compatibility system.
 * Eight kootas: Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, Nadi.
 * Data is inlined (no test-file imports) so this ships cleanly.
 */
const NAKSHATRA_GANA: Record<string, 'Deva' | 'Manushya' | 'Rakshasa'> = {
  'Ashwini': 'Deva', 'Mrigashira': 'Deva', 'Punarvasu': 'Deva', 'Pushya': 'Deva',
  'Hasta': 'Deva', 'Swati': 'Deva', 'Anuradha': 'Deva', 'Shravana': 'Deva', 'Revati': 'Deva',
  'Bharani': 'Manushya', 'Rohini': 'Manushya', 'Ardra': 'Manushya', 'Purva Phalguni': 'Manushya',
  'Uttara Phalguni': 'Manushya', 'Purva Ashadha': 'Manushya', 'Uttara Ashadha': 'Manushya',
  'Purva Bhadrapada': 'Manushya', 'Uttara Bhadrapada': 'Manushya',
  'Krittika': 'Rakshasa', 'Ashlesha': 'Rakshasa', 'Magha': 'Rakshasa', 'Chitra': 'Rakshasa',
  'Vishakha': 'Rakshasa', 'Jyeshtha': 'Rakshasa', 'Mula': 'Rakshasa',
  'Dhanishtha': 'Rakshasa', 'Shatabhisha': 'Rakshasa',
};

const NAKSHATRA_NADI: Record<string, 'Adi' | 'Madhya' | 'Antya'> = {
  'Ashwini': 'Adi', 'Ardra': 'Adi', 'Punarvasu': 'Adi', 'Uttara Phalguni': 'Adi',
  'Hasta': 'Adi', 'Jyeshtha': 'Adi', 'Mula': 'Adi', 'Shatabhisha': 'Adi', 'Purva Bhadrapada': 'Adi',
  'Bharani': 'Madhya', 'Mrigashira': 'Madhya', 'Pushya': 'Madhya', 'Purva Phalguni': 'Madhya',
  'Chitra': 'Madhya', 'Anuradha': 'Madhya', 'Purva Ashadha': 'Madhya', 'Dhanishtha': 'Madhya',
  'Uttara Bhadrapada': 'Madhya',
  'Krittika': 'Antya', 'Rohini': 'Antya', 'Ashlesha': 'Antya', 'Magha': 'Antya',
  'Swati': 'Antya', 'Vishakha': 'Antya', 'Uttara Ashadha': 'Antya', 'Shravana': 'Antya', 'Revati': 'Antya',
};

const NAKSHATRA_YONI: Record<string, string> = {
  'Ashwini': 'Horse', 'Shatabhisha': 'Horse', 'Bharani': 'Elephant', 'Revati': 'Elephant',
  'Pushya': 'Sheep', 'Krittika': 'Sheep', 'Rohini': 'Snake', 'Mrigashira': 'Snake',
  'Mula': 'Dog', 'Ardra': 'Dog', 'Ashlesha': 'Cat', 'Punarvasu': 'Cat',
  'Magha': 'Rat', 'Purva Phalguni': 'Rat', 'Uttara Phalguni': 'Cow', 'Uttara Bhadrapada': 'Cow',
  'Hasta': 'Buffalo', 'Swati': 'Buffalo', 'Vishakha': 'Tiger', 'Chitra': 'Tiger',
  'Jyeshtha': 'Hare', 'Anuradha': 'Hare', 'Purva Ashadha': 'Monkey', 'Shravana': 'Monkey',
  'Purva Bhadrapada': 'Lion', 'Dhanishtha': 'Lion', 'Uttara Ashadha': 'Mongoose',
};
const YONI_ENEMY: Record<string, string> = {
  'Horse': 'Buffalo', 'Buffalo': 'Horse', 'Elephant': 'Lion', 'Lion': 'Elephant',
  'Sheep': 'Monkey', 'Monkey': 'Sheep', 'Snake': 'Mongoose', 'Mongoose': 'Snake',
  'Dog': 'Hare', 'Hare': 'Dog', 'Cat': 'Rat', 'Rat': 'Cat', 'Cow': 'Tiger', 'Tiger': 'Cow',
};

const VALID_27 = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

function ganaScore(g1: string, g2: string): number {
  if (g1 === g2) return 6;
  if ((g1 === 'Deva' && g2 === 'Manushya') || (g1 === 'Manushya' && g2 === 'Deva')) return 5;
  if ((g1 === 'Deva' && g2 === 'Rakshasa') || (g1 === 'Rakshasa' && g2 === 'Deva')) return 1;
  return 0; // Manushya+Rakshasa
}
function nadiScore(n1: string, n2: string): number {
  return n1 === n2 ? 0 : 8; // Same Nadi = Nadi Dosha = 0
}
function yoniScore(y1: string, y2: string): number {
  if (y1 === y2) return 4;
  if (YONI_ENEMY[y1] === y2) return 0;
  return 2; // neutral
}
function taraScore(n1idx: number, n2idx: number): number {
  const fwd = ((n2idx - n1idx + 27) % 27) + 1;
  const rev = ((n1idx - n2idx + 27) % 27) + 1;
  const good = [1, 3, 5, 7];
  return (good.includes(fwd % 9) ? 1.5 : 0) + (good.includes(rev % 9) ? 1.5 : 0);
}

export interface AshtakootaResult {
  varna: number; vashya: number; tara: number; yoni: number;
  graha_maitri: number; gana: number; bhakoot: number; nadi: number;
  total: number; compatibility: 'Excellent' | 'Good' | 'Acceptable' | 'Challenging';
  nadi_dosha: boolean; bhakoot_dosha: boolean;
}

export function calculateAshtakoota(
  nakshatra1: string, nakshatra2: string, rashi1: number, rashi2: number
): AshtakootaResult {
  const n1idx = VALID_27.indexOf(nakshatra1);
  const n2idx = VALID_27.indexOf(nakshatra2);
  const gana1 = NAKSHATRA_GANA[nakshatra1] || 'Manushya';
  const gana2 = NAKSHATRA_GANA[nakshatra2] || 'Manushya';
  const nadi1 = NAKSHATRA_NADI[nakshatra1] || 'Adi';
  const nadi2 = NAKSHATRA_NADI[nakshatra2] || 'Adi';
  const yoni1 = NAKSHATRA_YONI[nakshatra1] || 'Horse';
  const yoni2 = NAKSHATRA_YONI[nakshatra2] || 'Horse';
  const varna = 1; const vashya = 2; const graha_maitri = 3; // simplified
  const tara = taraScore(n1idx >= 0 ? n1idx : 0, n2idx >= 0 ? n2idx : 0);
  const yoni = yoniScore(yoni1, yoni2);
  const gana = ganaScore(gana1, gana2);
  const nadi = nadiScore(nadi1, nadi2);
  const dist = Math.abs(rashi1 - rashi2);
  const bhakoot_dosha = [2, 5, 6].includes(Math.min(dist, 12 - dist));
  const bhakoot = bhakoot_dosha ? 0 : 7;
  const nadi_dosha = nadi1 === nadi2;
  const total = varna + vashya + tara + yoni + graha_maitri + gana + bhakoot + nadi;
  const compatibility = total >= 28 ? 'Excellent' : total >= 24 ? 'Good' : total >= 18 ? 'Acceptable' : 'Challenging';
  return { varna, vashya, tara, yoni, graha_maitri, gana, bhakoot, nadi, total, compatibility, nadi_dosha, bhakoot_dosha };
}
