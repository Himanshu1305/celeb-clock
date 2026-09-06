// Single source of truth — import from here in ALL test files.
//
// NOTE ON NAKSHATRA/RASHI CORRECTION (sprint v3, Task 4 hard-gate finding):
// The sprint's original ground-truth Nakshatras (Virat→Anuradha, SRK→Vishakha,
// Sachin→Punarvasu, Modi→Uttara Phalguni, Amitabh→Hasta) are astronomically
// INCORRECT for the given dates/times. Verified against the Swiss Ephemeris
// (@fusionstrings/panchangam), whose Sun positions match every celebrity's known
// Western zodiac sign 5/5 — proving the library is correct. The Moon simply is
// not in those Nakshatras on those dates at any hour under any ayanamsha.
// The `nakshatra`/`rashi` fields below are the CORRECT Lahiri values at the
// specified times; `wrong_nakshatra` holds the popularly-cited-but-wrong value
// that the calculator must NEVER assert as fact.
export const VIRAT = {
  name:'Virat Kohli', slug:'virat-kohli', dob:'1988-11-05',
  day:5, month:11, year:1988, time:'12:30',
  city:'Delhi', lat:28.6139, lon:77.2090, tz:5.5,
  western_zodiac:'Scorpio', nakshatra:'Uttara Phalguni', rashi:'Kanya',
  wrong_nakshatra:'Anuradha',
};
export const SRK = {
  name:'Shah Rukh Khan', slug:'shah-rukh-khan', dob:'1965-11-02',
  day:2, month:11, year:1965, time:'14:30',
  city:'Delhi', lat:28.6139, lon:77.2090, tz:5.5,
  western_zodiac:'Scorpio', nakshatra:'Dhanishtha', rashi:'Makara',
  wrong_nakshatra:'Vishakha',
};
export const SACHIN = {
  name:'Sachin Tendulkar', slug:'sachin-tendulkar', dob:'1973-04-24',
  day:24, month:4, year:1973, time:'12:00',
  city:'Mumbai', lat:19.0760, lon:72.8777, tz:5.5,
  western_zodiac:'Taurus', nakshatra:'Purva Ashadha', rashi:'Dhanu',
  wrong_nakshatra:'Punarvasu',
};
export const MODI = {
  name:'Narendra Modi', slug:'narendra-modi', dob:'1950-09-17',
  day:17, month:9, year:1950, time:'11:00',
  city:'Vadnagar', lat:23.7867, lon:72.6367, tz:5.5,
  western_zodiac:'Virgo', nakshatra:'Anuradha', rashi:'Vrischika',
  wrong_nakshatra:'Uttara Phalguni',
};
export const AMITABH = {
  name:'Amitabh Bachchan', slug:'amitabh-bachchan', dob:'1942-10-11',
  day:11, month:10, year:1942, time:'16:00',
  city:'Allahabad', lat:25.4358, lon:81.8463, tz:5.5,
  western_zodiac:'Libra', nakshatra:'Swati', rashi:'Tula',
  wrong_nakshatra:'Hasta',
};
export const PRICES = { birthday_report:199, kundali:199, combo:299, annual:1999 } as const;
export const VALID_27_NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
] as const;
export const NAKSHATRA_DEVANAGARI: Record<string,string> = {
  'Ashwini':'अश्विनी',
  'Bharani':'भरणी',
  'Krittika':'कृत्तिका',
  'Rohini':'रोहिणी',
  'Mrigashira':'मृगशिरा',
  'Ardra':'आर्द्रा',
  'Punarvasu':'पुनर्वसु',
  'Pushya':'पुष्य',
  'Ashlesha':'आश्लेषा',
  'Magha':'मघा',
  'Purva Phalguni':'पूर्वाफाल्गुनी',
  'Uttara Phalguni':'उत्तराफाल्गुनी',
  'Hasta':'हस्त',
  'Chitra':'चित्रा',
  'Swati':'स्वाती',
  'Vishakha':'विशाखा',
  'Anuradha':'अनुराधा',
  'Jyeshtha':'ज्येष्ठा',
  'Mula':'मूल',
  'Purva Ashadha':'पूर्वाषाढ़ा',
  'Uttara Ashadha':'उत्तराषाढ़ा',
  'Shravana':'श्रवण',
  'Dhanishtha':'धनिष्ठा',
  'Shatabhisha':'शतभिषा',
  'Purva Bhadrapada':'पूर्वाभाद्रपदा',
  'Uttara Bhadrapada':'उत्तराभाद्रपदा',
  'Revati':'रेवती',
};
export const RASHI_DEVANAGARI: Record<string,string> = {
  'Mesha':'मेष','Vrisha':'वृष',
  'Mithuna':'मिथुन','Karka':'कर्क',
  'Simha':'सिंह','Kanya':'कन्या',
  'Tula':'तुला','Vrischika':'वृश्चिक',
  'Dhanu':'धनु','Makara':'मकर',
  'Kumbha':'कुम्भ','Meena':'मीन',
};
export const NAKSHATRA_GANA: Record<string,'Deva'|'Manushya'|'Rakshasa'> = {
  'Ashwini':'Deva','Mrigashira':'Deva','Punarvasu':'Deva','Pushya':'Deva',
  'Hasta':'Deva','Swati':'Deva','Anuradha':'Deva','Shravana':'Deva','Revati':'Deva',
  'Bharani':'Manushya','Rohini':'Manushya','Ardra':'Manushya','Purva Phalguni':'Manushya',
  'Uttara Phalguni':'Manushya','Purva Ashadha':'Manushya','Uttara Ashadha':'Manushya',
  'Purva Bhadrapada':'Manushya','Uttara Bhadrapada':'Manushya',
  'Krittika':'Rakshasa','Ashlesha':'Rakshasa','Magha':'Rakshasa','Chitra':'Rakshasa',
  'Vishakha':'Rakshasa','Jyeshtha':'Rakshasa','Mula':'Rakshasa',
  'Dhanishtha':'Rakshasa','Shatabhisha':'Rakshasa',
};
export const NAKSHATRA_NADI: Record<string,'Adi'|'Madhya'|'Antya'> = {
  'Ashwini':'Adi','Ardra':'Adi','Punarvasu':'Adi','Uttara Phalguni':'Adi',
  'Hasta':'Adi','Jyeshtha':'Adi','Mula':'Adi','Shatabhisha':'Adi','Purva Bhadrapada':'Adi',
  'Bharani':'Madhya','Mrigashira':'Madhya','Pushya':'Madhya','Purva Phalguni':'Madhya',
  'Chitra':'Madhya','Anuradha':'Madhya','Purva Ashadha':'Madhya','Dhanishtha':'Madhya',
  'Uttara Bhadrapada':'Madhya',
  'Krittika':'Antya','Rohini':'Antya','Ashlesha':'Antya','Magha':'Antya',
  'Swati':'Antya','Vishakha':'Antya','Uttara Ashadha':'Antya','Shravana':'Antya','Revati':'Antya',
};
export const NAKSHATRA_AKSHARAS: Record<string,string[]> = {
  'Ashwini':['Chu','Che','Cho','La'],'Bharani':['Li','Lu','Le','Lo'],
  'Krittika':['A','I','U','E'],'Rohini':['O','Va','Vi','Vu'],
  'Mrigashira':['Ve','Vo','Ka','Ki'],'Ardra':['Ku','Gha','Ing','Jha'],
  'Punarvasu':['Ke','Ko','Ha','Hi'],'Pushya':['Hu','He','Ho','Da'],
  'Ashlesha':['Di','Du','De','Do'],'Magha':['Ma','Mi','Mu','Me'],
  'Purva Phalguni':['Mo','Ta','Ti','Tu'],'Uttara Phalguni':['Te','To','Pa','Pi'],
  'Hasta':['Pu','Sha','Na','Tha'],'Chitra':['Pe','Po','Ra','Ri'],
  'Swati':['Ru','Re','Ro','Ta'],'Vishakha':['Ti','Tu','Te','To'],
  'Anuradha':['Na','Ni','Nu','Ne'],'Jyeshtha':['No','Ya','Yi','Yu'],
  'Mula':['Ye','Yo','Bha','Bhi'],'Purva Ashadha':['Bhu','Dha','Pha','Dha'],
  'Uttara Ashadha':['Bhe','Bho','Ja','Ji'],'Shravana':['Khi','Khu','Khe','Kho'],
  'Dhanishtha':['Ga','Gi','Gu','Ge'],'Shatabhisha':['Go','Sa','Si','Su'],
  'Purva Bhadrapada':['Se','So','Da','Di'],'Uttara Bhadrapada':['Du','Tha','Jha','Tra'],
  'Revati':['De','Do','Cha','Chi'],
};
