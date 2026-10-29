/**
 * FAQ text for the year muhurat pages (/muhurat/:type/:year, batch 9b).
 * Every statement mirrors the rules in muhuratYear.ts (OCCASION_RULES) or the season
 * dates computed into the static file; match figures come from muhuratYear.test.ts.
 */
import type { SeasonLabel } from './muhuratYear';
export type { SeasonLabel };

const nice = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function muhuratYearFaqs(slug: string, year: number, seasons: SeasonLabel[]): Array<{ question: string; answer: string }> {
  const chat = seasons.find(s => s.kind === 'chaturmas' && s.from.startsWith(String(year)));
  const cityQ = {
    question: 'Why do the times differ from city to city?',
    answer: 'The Tithi and Nakshatra change at the same moment everywhere, but a Hindu day runs from local sunrise to the next sunrise, and the clock time depends on the time zone. So a window can start or end at a different local time, and occasionally fall on a different date, in another city. The list above is for New Delhi; choose your city to recompute it in your browser.',
  };
  switch (slug) {
    case 'marriage': return [
      {
        question: `How are the ${year} marriage muhurat dates chosen?`,
        answer: 'Each window is a stretch of time when the Moon is in one of the 11 classical wedding Nakshatras (Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Mula, Uttara Ashadha, Uttara Bhadrapada, Revati), outside the Gandanta quarters, outside Bhadra and the harsh Yogas — and the day is not in Kharmas, Chaturmas, an Adhik month, the Sun’s month in Kanya, or a Guru/Shukra Asta. This is the Panchang Shuddhi step; your priest then fixes the exact Lagna (wedding moment) inside the window.',
      },
      {
        question: `Why are there no wedding dates in some months of ${year}?`,
        answer: chat
          ? `Weddings pause during Chaturmas — in ${year} from Devshayani Ekadashi (${nice(chat.from)}) to Devutthana (Dev Uthani) Ekadashi (${nice(chat.to)}) — and during Kharmas, when the Sun is in Dhanu (about mid-December to mid-January) or Meena (about mid-March to mid-April). They also pause while Venus or Jupiter is combust (Asta) and in an Adhik (leap) month. The exact dates are listed above.`
          : 'Weddings pause during Kharmas (Sun in Dhanu or Meena), Chaturmas, an Adhik (leap) month and while Venus or Jupiter is combust (Asta). The exact dates are listed above.',
      },
      {
        question: 'Do these dates match Drik Panchang?',
        answer: 'We follow the same Panchang-only rules as Drik Panchang’s marriage list. In our automated test against Drik’s published 2026 list for New Delhi (January to mid-July, the part we could read), 47 of its 48 dates appear here, and the time windows on those dates agree to within 5 minutes. Drik also offers a separate list that checks the Lagna; a priest’s final choice may be narrower.',
      },
      cityQ,
      {
        question: 'Is a muhurat date enough on its own?',
        answer: 'It is the starting point. Families usually also match the couple’s Kundalis and have the priest choose the Lagna for the ceremony. A good muhurat is classical guidance for a calm, well-timed start — not a guarantee of anything.',
      },
    ];
    case 'griha-pravesh': return [
      {
        question: `How are the ${year} Griha Pravesh dates chosen?`,
        answer: 'A window qualifies when the Moon is in Rohini, Mrigashira, Uttara Phalguni, Chitra, Anuradha, Uttara Ashadha, Uttara Bhadrapada or Revati, the Tithi is Shukla Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi or Trayodashi, or Krishna Pratipada, Dwitiya, Tritiya, Panchami, Saptami, Dashami or Ekadashi, the day is not a Tuesday or Sunday, and the lunar month is Magha, Phalguna, Vaishakha, Jyeshtha, Kartika or Margashirsha — never in Chaturmas, an Adhik month or while Venus or Jupiter is combust.',
      },
      {
        question: 'Do these dates match Drik Panchang?',
        answer: 'We use the rules behind Drik Panchang’s Griha Pravesh list. In our automated test against Drik’s published 2026 list (January to July, as Drik served it for Dubai), all 22 of its dates appear here with matching time windows, and we list one extra day. Drik’s November–December list could not be read for the test, so the Kartika and Margashirsha months follow the customary rule.',
      },
      cityQ,
      {
        question: 'Can I move into a rented flat on any day?',
        answer: 'Many families follow the full muhurat only for the first entry into a newly built or newly bought home; for a rented home or a return after a journey the customs are lighter. Your family priest can advise what your tradition follows.',
      },
    ];
    case 'vehicle-purchase': return [
      {
        question: `How are the ${year} vehicle purchase dates chosen?`,
        answer: 'A window qualifies when the Moon is in Rohini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Anuradha, Shravana, Dhanishtha, Shatabhisha or Revati, the Tithi is Tritiya, Panchami, Shashthi, Ashtami, Dashami, Ekadashi, Trayodashi, Purnima or Krishna Pratipada, and the day is not a Tuesday or Saturday or in an Adhik (leap) month. Windows that only open late at night are left out.',
      },
      {
        question: 'Do these dates match Drik Panchang?',
        answer: 'We use the rules behind Drik Panchang’s vehicle-purchase list. In our automated test against Drik’s published 2026 list for New Delhi (January to early August, the part we could read), all 52 of its dates appear here with time windows agreeing to within a few minutes; we list one extra late-evening window.',
      },
      cityQ,
      {
        question: 'Does the muhurat apply to booking, payment or delivery?',
        answer: 'Customs differ — many people take delivery or bring the vehicle home in the window, others make the payment or do the vehicle puja then. Use the window for whichever step your family treats as the start.',
      },
    ];
    case 'mundan': return [
      {
        question: `How are the ${year} Mundan dates chosen?`,
        answer: 'Mundan (Chudakarana) is listed only in daylight while the Sun is in Makara, Kumbha, Mesha, Vrishabha or Mithuna, on a Monday, Wednesday, Thursday or Friday, with a suitable Tithi (Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Trayodashi) and Nakshatra (Ashwini, Mrigashira, Punarvasu, Pushya, Hasta, Chitra, Swati, Jyeshtha, Shravana, Dhanishtha, Shatabhisha, Revati) — avoiding Bhadra, harsh Yogas, Sankranti and eclipse days, an Adhik month and Guru/Shukra Asta.',
      },
      {
        question: 'Why are there no Mundan dates in the second half of the year?',
        answer: 'Tradition does the first haircut while the Sun is in Makara, Kumbha, Mesha, Vrishabha or Mithuna — roughly mid-January to mid-July, skipping the Meena month (mid-March to mid-April). From mid-July to mid-January there are no Mundan dates.',
      },
      {
        question: 'Will a priest’s date match this list?',
        answer: 'This is the general Panchang list. Drik Panchang and family priests then check the Lagna and the child’s own Moon and star (Chandra and Tara bala), so a priest may pick fewer days or a narrower time. The child’s age and family custom come first.',
      },
      cityQ,
    ];
    case 'naamkaran': return [
      {
        question: `How are the ${year} Naamkaran dates chosen?`,
        answer: 'A forenoon window qualifies when the Moon is in a fixed, movable, gentle or short Nakshatra, the Tithi is Pratipada, Dwitiya, Tritiya, Panchami, Saptami, Dashami, Ekadashi, Dwadashi or Trayodashi, and the day is a Monday, Wednesday, Thursday or Friday — avoiding Bhadra, harsh Yogas, Gandanta, Sankranti and eclipse days.',
      },
      {
        question: 'Do we need a muhurat if the naming is on the 11th or 12th day?',
        answer: 'Traditionally no — the naming on the 11th or 12th day after birth is itself the prescribed time. These dates are for families who hold the ceremony later.',
      },
      {
        question: 'Why only morning times?',
        answer: 'The naming ceremony is preferably done in the first half of the day, before the afternoon, so the list shows windows between sunrise and midday.',
      },
      cityQ,
    ];
    default: return [];
  }
}
