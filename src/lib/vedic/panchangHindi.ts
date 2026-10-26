/**
 * Devanagari names for the Panchang (round-2 audit T8), shared by the Hindi Panchang
 * page and the Hindi daily template (batch 7). Pure data — no engine imports.
 */
export const WEEKDAY_HI: Record<string, string> = {
  Sunday: 'रविवार', Monday: 'सोमवार', Tuesday: 'मंगलवार', Wednesday: 'बुधवार',
  Thursday: 'गुरुवार', Friday: 'शुक्रवार', Saturday: 'शनिवार',
};
export const CITY_HI: Record<string, string> = {
  delhi: 'दिल्ली', mumbai: 'मुंबई', bengaluru: 'बेंगलुरु', kolkata: 'कोलकाता',
  chennai: 'चेन्नई', hyderabad: 'हैदराबाद', pune: 'पुणे', ahmedabad: 'अहमदाबाद',
  jaipur: 'जयपुर', lucknow: 'लखनऊ',
};
export const cityHi = (slug: string, fallback: string) => CITY_HI[slug] || fallback;
// Devanagari names for the Panchang limbs (round-2 audit T8: names were left in English letters).
export const TITHI_HI: Record<string, string> = {
  Pratipada: 'प्रतिपदा', Dwitiya: 'द्वितीया', Tritiya: 'तृतीया', Chaturthi: 'चतुर्थी', Panchami: 'पंचमी', Shashthi: 'षष्ठी',
  Saptami: 'सप्तमी', Ashtami: 'अष्टमी', Navami: 'नवमी', Dashami: 'दशमी', Ekadashi: 'एकादशी', Dwadashi: 'द्वादशी',
  Trayodashi: 'त्रयोदशी', Chaturdashi: 'चतुर्दशी', Purnima: 'पूर्णिमा', Amavasya: 'अमावस्या',
};
export const PAKSHA_HI: Record<string, string> = { Shukla: 'शुक्ल', Krishna: 'कृष्ण' };
export const NAKSHATRA_HI: Record<string, string> = {
  Ashwini: 'अश्विनी', Bharani: 'भरणी', Krittika: 'कृत्तिका', Rohini: 'रोहिणी', Mrigashira: 'मृगशिरा', Ardra: 'आर्द्रा',
  Punarvasu: 'पुनर्वसु', Pushya: 'पुष्य', Ashlesha: 'आश्लेषा', Magha: 'मघा', 'Purva Phalguni': 'पूर्वा फाल्गुनी',
  'Uttara Phalguni': 'उत्तरा फाल्गुनी', Hasta: 'हस्त', Chitra: 'चित्रा', Swati: 'स्वाती', Vishakha: 'विशाखा',
  Anuradha: 'अनुराधा', Jyeshtha: 'ज्येष्ठा', Mula: 'मूल', 'Purva Ashadha': 'पूर्वाषाढ़ा', 'Uttara Ashadha': 'उत्तराषाढ़ा',
  Shravana: 'श्रवण', Dhanishtha: 'धनिष्ठा', Shatabhisha: 'शतभिषा', 'Purva Bhadrapada': 'पूर्वा भाद्रपद',
  'Uttara Bhadrapada': 'उत्तरा भाद्रपद', Revati: 'रेवती',
};
export const YOGA_HI: Record<string, string> = {
  Vishkambha: 'विष्कुम्भ', Priti: 'प्रीति', Ayushman: 'आयुष्मान', Saubhagya: 'सौभाग्य', Shobhana: 'शोभन', Atiganda: 'अतिगण्ड',
  Sukarma: 'सुकर्मा', Dhriti: 'धृति', Shula: 'शूल', Ganda: 'गण्ड', Vriddhi: 'वृद्धि', Dhruva: 'ध्रुव', Vyaghata: 'व्याघात',
  Harshana: 'हर्षण', Vajra: 'वज्र', Siddhi: 'सिद्धि', Vyatipata: 'व्यतीपात', Variyana: 'वरीयान', Parigha: 'परिघ', Shiva: 'शिव',
  Siddha: 'सिद्ध', Sadhya: 'साध्य', Shubha: 'शुभ', Shukla: 'शुक्ल', Brahma: 'ब्रह्म', Indra: 'इन्द्र', Vaidhriti: 'वैधृति',
};
export const KARANA_HI: Record<string, string> = {
  Bava: 'बव', Balava: 'बालव', Kaulava: 'कौलव', Taitila: 'तैतिल', Gara: 'गर', Vanija: 'वणिज', 'Vishti (Bhadra)': 'विष्टि (भद्रा)',
  Shakuni: 'शकुनि', Chatushpada: 'चतुष्पद', Naga: 'नाग', Kimstughna: 'किंस्तुघ्न',
};
export const CHOGH_HI: Record<string, string> = {
  Amrit: 'अमृत', Shubh: 'शुभ', Labh: 'लाभ', Char: 'चर', Udveg: 'उद्वेग', Kaal: 'काल', Rog: 'रोग',
};
export const hiEnd = (s: string) => s.replace(' (next day)', ' (अगले दिन)');
