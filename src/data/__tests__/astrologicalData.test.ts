import { describe, it, expect } from 'vitest';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
  CHINESE_ZODIAC_PROFILES, NAKSHATRA_PROFILES, LIFE_PATH_EXTENDED,
} from '../astrologicalData';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const RASHIS = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const ANIMALS = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const LP_NUMS = [1,2,3,4,5,6,7,8,9,11,22,33];

// Expected values (authoritative)
const EXPECTED_TAROT: Record<string,string> = {
  Aries:'The Emperor', Taurus:'The Hierophant', Gemini:'The Lovers', Cancer:'The Chariot',
  Leo:'Strength', Virgo:'The Hermit', Libra:'Justice', Scorpio:'Death',
  Sagittarius:'Temperance', Capricorn:'The Devil', Aquarius:'The Star', Pisces:'The Moon',
};
const EXPECTED_VEDIC_STONES: Record<string,string> = {
  Mesha:'Red Coral', Vrishabha:'Diamond', Mithuna:'Emerald', Karka:'Pearl',
  Simha:'Ruby', Kanya:'Emerald', Tula:'Diamond', Vrischika:'Red Coral',
  Dhanu:'Yellow Sapphire', Makara:'Blue Sapphire', Kumbha:'Blue Sapphire', Meena:'Yellow Sapphire',
};
const EXPECTED_MANTRAS: Record<string,string> = {
  Mesha:'Om Ang Angarakaya Namah', Vrischika:'Om Ang Angarakaya Namah',
  Vrishabha:'Om Shum Shukraya Namah', Tula:'Om Shum Shukraya Namah',
  Mithuna:'Om Bum Budhaya Namah', Kanya:'Om Bum Budhaya Namah',
  Karka:'Om Som Somaya Namah', Simha:'Om Hrim Hraum Suryaya Namah',
  Dhanu:'Om Brim Brihaspataye Namah', Meena:'Om Brim Brihaspataye Namah',
  Makara:'Om Sham Shanaischaraya Namah', Kumbha:'Om Sham Shanaischaraya Namah',
};

// ── WESTERN ZODIAC ────────────────────────────────────────────
describe('WESTERN_ZODIAC_PROFILES', () => {

  it('TC-AD-01: all 12 signs present', () => {
    SIGNS.forEach(s => expect(WESTERN_ZODIAC_PROFILES[s], `Missing ${s}`).toBeTruthy());
  });

  it('TC-AD-02: tarot cards correct (standard Rider-Waite)', () => {
    Object.entries(EXPECTED_TAROT).forEach(([sign, card]) => {
      expect(WESTERN_ZODIAC_PROFILES[sign].tarot_card, `${sign} tarot`).toBe(card);
    });
  });

  it('TC-AD-03: Scorpio tarot is "Death" exactly (not "The Death")', () => {
    expect(WESTERN_ZODIAC_PROFILES.Scorpio.tarot_card).toBe('Death');
  });

  it('TC-AD-04: all lucky days are valid days of the week', () => {
    const valid = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    SIGNS.forEach(s => expect(valid, `${s}: ${WESTERN_ZODIAC_PROFILES[s].lucky_day}`).toContain(WESTERN_ZODIAC_PROFILES[s].lucky_day));
  });

  it('TC-AD-05: all signs have ≥3 strengths', () => {
    SIGNS.forEach(s => expect(WESTERN_ZODIAC_PROFILES[s].strengths.length, `${s} strengths`).toBeGreaterThanOrEqual(3));
  });

  it('TC-AD-06: all signs have ≥3 weaknesses', () => {
    SIGNS.forEach(s => expect(WESTERN_ZODIAC_PROFILES[s].weaknesses.length, `${s} weaknesses`).toBeGreaterThanOrEqual(3));
  });

  it('TC-AD-07: all personality_summary ≥ 50 chars', () => {
    SIGNS.forEach(s => expect(WESTERN_ZODIAC_PROFILES[s].personality_summary.length, `${s} summary`).toBeGreaterThanOrEqual(50));
  });

  it('TC-AD-08: all career_strengths ≥ 30 chars', () => {
    SIGNS.forEach(s => expect(WESTERN_ZODIAC_PROFILES[s].career_strengths.length, `${s} career`).toBeGreaterThanOrEqual(30));
  });

  it('TC-AD-09: all compatibility lists have ≥2 entries', () => {
    SIGNS.forEach(s => {
      expect(WESTERN_ZODIAC_PROFILES[s].love_compatibility.length, `${s} compat`).toBeGreaterThanOrEqual(2);
      expect(WESTERN_ZODIAC_PROFILES[s].challenging_signs.length, `${s} challenging`).toBeGreaterThanOrEqual(1);
    });
  });

  it('TC-AD-10: no undefined or [object Object]', () => {
    const str = JSON.stringify(WESTERN_ZODIAC_PROFILES);
    expect(str).not.toContain('undefined');
    expect(str).not.toContain('[object Object]');
  });

  it('TC-AD-11: Scorpio lucky day is Tuesday (Mars-ruled)', () => {
    expect(WESTERN_ZODIAC_PROFILES.Scorpio.lucky_day).toBe('Tuesday');
  });

  it('TC-AD-12: Leo lucky colors contains Gold (Sun-ruled)', () => {
    expect(WESTERN_ZODIAC_PROFILES.Leo.lucky_colors).toContain('Gold');
  });

});

// ── VEDIC RASHI ───────────────────────────────────────────────
describe('VEDIC_RASHI_PROFILES', () => {

  it('TC-AD-13: all 12 Rashis present', () => {
    RASHIS.forEach(r => expect(VEDIC_RASHI_PROFILES[r], `Missing ${r}`).toBeTruthy());
  });

  it('TC-AD-14: lucky stones match ruling planet tradition', () => {
    Object.entries(EXPECTED_VEDIC_STONES).forEach(([rashi, stone]) => {
      expect(VEDIC_RASHI_PROFILES[rashi].lucky_stone, `${rashi} stone`).toBe(stone);
    });
  });

  it('TC-AD-15: mantras correct for each ruling planet', () => {
    Object.entries(EXPECTED_MANTRAS).forEach(([rashi, mantra]) => {
      expect(VEDIC_RASHI_PROFILES[rashi].mantra, `${rashi} mantra`).toBe(mantra);
    });
  });

  it('TC-AD-16: all Rashis have Devanagari (Unicode 0900-097F)', () => {
    RASHIS.forEach(r => {
      const dev = VEDIC_RASHI_PROFILES[r].rashi_devanagari;
      expect(dev.length, `${r} Devanagari empty`).toBeGreaterThan(0);
      expect(/[ऀ-ॿ]/.test(dev), `${r} not Devanagari`).toBe(true);
    });
  });

  it('TC-AD-17: all lord names have Devanagari', () => {
    RASHIS.forEach(r => {
      expect(/[ऀ-ॿ]/.test(VEDIC_RASHI_PROFILES[r].lord_devanagari), `${r} lord Devanagari`).toBe(true);
    });
  });

  it('TC-AD-18: all Rashis have Hindi stone name', () => {
    RASHIS.forEach(r => expect(VEDIC_RASHI_PROFILES[r].lucky_stone_hindi.length, `${r} Hindi stone`).toBeGreaterThan(0));
  });

  it('TC-AD-19: all lucky directions are valid', () => {
    const valid = ['North','South','East','West','North East','North West','South East','South West'];
    RASHIS.forEach(r => expect(valid, `${r}: ${VEDIC_RASHI_PROFILES[r].lucky_direction}`).toContain(VEDIC_RASHI_PROFILES[r].lucky_direction));
  });

  it('TC-AD-20: Vrischika — Red Coral, Tuesday, 9, South West, Iron', () => {
    const p = VEDIC_RASHI_PROFILES.Vrischika;
    expect(p.lucky_stone).toBe('Red Coral');
    expect(p.lucky_stone_hindi).toBe('Moonga');
    expect(p.lucky_day).toBe('Tuesday');
    expect(p.lucky_number).toBe(9);
    expect(p.lucky_direction).toBe('South West');
    expect(p.lucky_metal).toBe('Iron');
  });

  it('TC-AD-21: Simha — Ruby (Manikya), Sunday, East, Gold', () => {
    const p = VEDIC_RASHI_PROFILES.Simha;
    expect(p.lucky_stone).toBe('Ruby');
    expect(p.lucky_stone_hindi).toBe('Manikya');
    expect(p.lucky_day).toBe('Sunday');
    expect(p.lucky_direction).toBe('East');
    expect(p.lucky_metal).toBe('Gold');
  });

  it('TC-AD-22: all health_tendencies ≥ 30 chars', () => {
    RASHIS.forEach(r => expect(VEDIC_RASHI_PROFILES[r].health_tendencies.length, `${r} health`).toBeGreaterThan(30));
  });

  it('TC-AD-23: no undefined or [object Object]', () => {
    const str = JSON.stringify(VEDIC_RASHI_PROFILES);
    expect(str).not.toContain('undefined');
    expect(str).not.toContain('[object Object]');
  });

});

// ── CHINESE ZODIAC ────────────────────────────────────────────
describe('CHINESE_ZODIAC_PROFILES', () => {

  it('TC-AD-24: all 12 animals present', () => {
    ANIMALS.forEach(a => expect(CHINESE_ZODIAC_PROFILES[a], `Missing ${a}`).toBeTruthy());
  });

  it('TC-AD-25: Dragon element_fixed is Earth (1988 = Earth Dragon)', () => {
    expect(CHINESE_ZODIAC_PROFILES.Dragon.element_fixed).toBe('Earth');
  });

  it('TC-AD-26: all animals have emoji', () => {
    ANIMALS.forEach(a => expect(CHINESE_ZODIAC_PROFILES[a].emoji.length, `${a} emoji`).toBeGreaterThan(0));
  });

  it('TC-AD-27: all animals have ≥1 lucky flower', () => {
    ANIMALS.forEach(a => expect(CHINESE_ZODIAC_PROFILES[a].lucky_flowers.length, `${a} flowers`).toBeGreaterThanOrEqual(1));
  });

  it('TC-AD-28: no undefined or [object Object]', () => {
    expect(JSON.stringify(CHINESE_ZODIAC_PROFILES)).not.toContain('undefined');
  });

});

// ── NAKSHATRA ─────────────────────────────────────────────────
describe('NAKSHATRA_PROFILES', () => {

  it('TC-AD-29: exactly 27 Nakshatras', () => {
    expect(Object.keys(NAKSHATRA_PROFILES).length).toBe(27);
  });

  it('TC-AD-30: Nakshatra numbers 1-27 all unique and present', () => {
    const nums = Object.values(NAKSHATRA_PROFILES).map(n => n.number).sort((a,b) => a-b);
    expect(nums).toEqual([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]);
  });

  it('TC-AD-31: Anuradha — number 17, lord Shani, gana Deva', () => {
    expect(NAKSHATRA_PROFILES.Anuradha.number).toBe(17);
    expect(NAKSHATRA_PROFILES.Anuradha.lord).toBe('Shani');
    expect(NAKSHATRA_PROFILES.Anuradha.gana).toBe('Deva');
  });

  it('TC-AD-32: all ganas valid (Deva/Manushya/Rakshasa)', () => {
    const valid = ['Deva','Manushya','Rakshasa'];
    Object.values(NAKSHATRA_PROFILES).forEach(n => {
      expect(valid, `${n.nakshatra}: ${n.gana}`).toContain(n.gana);
    });
  });

  it('TC-AD-33: all personality_summaries ≥ 30 chars', () => {
    Object.values(NAKSHATRA_PROFILES).forEach(n => {
      expect(n.personality_summary.length, `${n.nakshatra} summary`).toBeGreaterThan(30);
    });
  });

});

// ── LIFE PATH ─────────────────────────────────────────────────
describe('LIFE_PATH_EXTENDED', () => {

  it('TC-AD-34: all 13 life path entries present', () => {
    LP_NUMS.forEach(n => expect(LIFE_PATH_EXTENDED[n], `Missing LP ${n}`).toBeTruthy());
  });

  it('TC-AD-35: master numbers 11, 22, 33 have "Master" in title', () => {
    expect(LIFE_PATH_EXTENDED[11].title).toContain('Master');
    expect(LIFE_PATH_EXTENDED[22].title).toContain('Master');
    expect(LIFE_PATH_EXTENDED[33].title).toContain('Master');
  });

  it('TC-AD-36: all have ≥3 career paths', () => {
    LP_NUMS.forEach(n => expect(LIFE_PATH_EXTENDED[n].career_paths.length, `LP ${n} careers`).toBeGreaterThanOrEqual(3));
  });

  it('TC-AD-37: all have lucky stone and lucky color', () => {
    LP_NUMS.forEach(n => {
      expect(LIFE_PATH_EXTENDED[n].lucky_stone.length, `LP ${n} stone`).toBeGreaterThan(0);
      expect(LIFE_PATH_EXTENDED[n].lucky_color.length, `LP ${n} color`).toBeGreaterThan(0);
    });
  });

  it('TC-AD-38: no undefined or [object Object]', () => {
    expect(JSON.stringify(LIFE_PATH_EXTENDED)).not.toContain('undefined');
  });

});
