/**
 * Source labels for remedies. Each remedy cites ONE of these. Where a practice
 * has no classical text behind it, it is labelled honestly as popular practice
 * rather than attributed to a book it does not come from.
 *
 * Mantra texts were checked on 24 Oct 2026: the nine beej mantras and their
 * traditional japa counts against vedicmarga.com/navagraha-beej-mantras (Shani
 * also against drikpanchang.com shani-mantras); the Navagraha Stotra attribution
 * ("iti shri vyasa virachitam navagraha stotram") against sanskritdocuments.org;
 * the Maha Mrityunjaya mantra as Rigveda 7.59.12 against Wikipedia; Aditya
 * Hridayam as Valmiki Ramayana, Yuddha Kanda sarga 105 against valmikiramayan.net.
 */
export const SRC = {
  beej: 'Navagraha beej mantra (traditional graha-japa manuals)',
  navagrahaStotra: 'Navagraha Stotra, attributed to Vyasa',
  mahaMrityunjaya: 'Maha Mrityunjaya mantra — Rigveda 7.59.12 (also in the Yajurveda)',
  hanumanChalisa: 'Hanuman Chalisa — Goswami Tulsidas',
  adityaHridayam: 'Aditya Hridayam — Valmiki Ramayana, Yuddha Kanda (sarga 105)',
  panchakshari: 'Om Namah Shivaya (Panchakshari) — Shaiva tradition (Sri Rudram, Yajurveda)',
  vara: 'Weekday (vara) vrat tradition — each weekday is ruled by its planet',
  daan: 'Navagraha daan tradition (graha-shanti practice)',
  lalKitab: 'Lal Kitab (folk remedy tradition)',
  grahaShanti: 'Graha Shanti / Navagraha puja tradition (Parashari remedial practice, BPHS)',
  devata: 'Popular graha–devata tradition (each planet paired with a deity)',
  shraddha: 'Shraddha and Pitru Paksha tradition (Puranic and Dharmashastra)',
  temple: 'Temple tradition (verified temple list)',
  matching: 'Popular Jyotish practice for Ashtakoota matching',
  bphs: 'Brihat Parashara Hora Shastra (BPHS)',
  gemTradition: 'Ratna (gemstone) tradition — read through the full chart, as on /gemstones',
  dasharathaShani: 'Shani Stotra attributed to King Dasharatha (traditional recitation)',
  ganesha: 'Om Gam Ganapataye Namah — Ganapati tradition',
  gandamool: 'Gandamool Shanti custom — 27th day after birth or the next recurrence of the birth nakshatra (as given by Drik Panchang)',
  sense: 'Practical, constructive habit (no special source needed)',
} as const;
