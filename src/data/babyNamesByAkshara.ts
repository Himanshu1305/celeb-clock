/**
 * Baby names by Nakshatra starting-syllable (akshara) — Growth P1-6.
 *
 * ORIGINAL, hand-curated dataset: common Indian given names grouped by their
 * starting sound, each with gender and a well-established meaning. Compiled from
 * general knowledge of Sanskrit/Hindi name meanings — not scraped from any
 * competitor or paid names database. Meanings are kept to widely-accepted ones;
 * where a name has several readings we give the most common.
 *
 * Keyed by the same aksharas used in nakshatraAksharas.ts, so a Nakshatra's four
 * padas map straight onto these name lists.
 */
export type Gender = 'boy' | 'girl' | 'unisex';
export interface BabyName { name: string; gender: Gender; meaning: string; }

export const NAMES_BY_AKSHARA: Record<string, BabyName[]> = {
  // A / I / U / E / O (Krittika, Rohini)
  A: [{ name: 'Aarav', gender: 'boy', meaning: 'peaceful, wise' }, { name: 'Ananya', gender: 'girl', meaning: 'unique, matchless' }, { name: 'Arjun', gender: 'boy', meaning: 'bright, shining; the Pandava hero' }, { name: 'Aditi', gender: 'girl', meaning: 'boundless; mother of the gods' }],
  I: [{ name: 'Ira', gender: 'girl', meaning: 'the earth; goddess Saraswati' }, { name: 'Ishaan', gender: 'boy', meaning: 'the sun; a form of Shiva' }, { name: 'Indira', gender: 'girl', meaning: 'goddess Lakshmi' }],
  U: [{ name: 'Utkarsh', gender: 'boy', meaning: 'advancement, prosperity' }, { name: 'Uma', gender: 'girl', meaning: 'goddess Parvati; tranquillity' }, { name: 'Udhav', gender: 'boy', meaning: 'festival; a friend of Krishna' }],
  E: [{ name: 'Ekta', gender: 'girl', meaning: 'unity' }, { name: 'Ekansh', gender: 'boy', meaning: 'whole, complete' }],
  O: [{ name: 'Om', gender: 'boy', meaning: 'the sacred primordial sound' }, { name: 'Ojas', gender: 'boy', meaning: 'vitality, lustre' }, { name: 'Omisha', gender: 'girl', meaning: 'goddess of birth and death' }],
  // Va / Vi / Vu / Ve / Vo
  Va: [{ name: 'Varun', gender: 'boy', meaning: 'god of the waters' }, { name: 'Vani', gender: 'girl', meaning: 'speech; goddess Saraswati' }, { name: 'Vasudha', gender: 'girl', meaning: 'the earth' }],
  Vi: [{ name: 'Vihaan', gender: 'boy', meaning: 'dawn, the start of a new day' }, { name: 'Vidya', gender: 'girl', meaning: 'knowledge, learning' }, { name: 'Vivaan', gender: 'boy', meaning: 'full of life' }],
  Vu: [{ name: 'Vrushank', gender: 'boy', meaning: 'righteous' }],
  Ve: [{ name: 'Vedant', gender: 'boy', meaning: 'the end of the Vedas; ultimate wisdom' }, { name: 'Veda', gender: 'girl', meaning: 'sacred knowledge' }],
  Vo: [],
  // Ka / Ki / Ku / Ke / Ko
  Ka: [{ name: 'Karan', gender: 'boy', meaning: 'skilful; the warrior Karna' }, { name: 'Kavya', gender: 'girl', meaning: 'poetry' }, { name: 'Kartik', gender: 'boy', meaning: 'bestowing courage; son of Shiva' }],
  Ki: [{ name: 'Kiran', gender: 'unisex', meaning: 'a ray of light' }, { name: 'Kirti', gender: 'girl', meaning: 'fame, glory' }],
  Ku: [{ name: 'Kunal', gender: 'boy', meaning: 'lotus; a bird with beautiful eyes' }, { name: 'Kumud', gender: 'unisex', meaning: 'the night lotus' }],
  Ke: [{ name: 'Keshav', gender: 'boy', meaning: 'a name of Krishna' }, { name: 'Ketan', gender: 'boy', meaning: 'home; a banner' }],
  Ko: [{ name: 'Komal', gender: 'girl', meaning: 'tender, soft' }],
  Gha: [], Ing: [],
  Jha: [],
  // Ha / Hi / Hu / He / Ho
  Ha: [{ name: 'Harsh', gender: 'boy', meaning: 'joy, happiness' }, { name: 'Hansa', gender: 'girl', meaning: 'a swan; purity' }, { name: 'Hari', gender: 'boy', meaning: 'a name of Vishnu' }],
  Hi: [{ name: 'Hitesh', gender: 'boy', meaning: 'one who wishes others well' }, { name: 'Himani', gender: 'girl', meaning: 'goddess Parvati; snow' }],
  Hu: [{ name: 'Humera', gender: 'girl', meaning: 'a mythical bird of fortune' }],
  He: [{ name: 'Hemant', gender: 'boy', meaning: 'early winter; golden' }, { name: 'Hema', gender: 'girl', meaning: 'golden' }],
  Ho: [],
  // Da / Di / Du / De / Do
  Da: [{ name: 'Dev', gender: 'boy', meaning: 'god, divine' }, { name: 'Diya', gender: 'girl', meaning: 'a lamp, light' }, { name: 'Daksh', gender: 'boy', meaning: 'capable, skilled' }],
  Di: [{ name: 'Divya', gender: 'girl', meaning: 'divine, brilliant' }, { name: 'Dinesh', gender: 'boy', meaning: 'the sun (lord of the day)' }],
  Du: [{ name: 'Durga', gender: 'girl', meaning: 'the invincible goddess' }],
  De: [{ name: 'Deepak', gender: 'boy', meaning: 'a lamp; light' }, { name: 'Deepa', gender: 'girl', meaning: 'a lamp' }, { name: 'Dev', gender: 'boy', meaning: 'divine' }],
  Do: [],
  // Ma / Mi / Mu / Me / Mo
  Ma: [{ name: 'Manish', gender: 'boy', meaning: 'lord of the mind; intellect' }, { name: 'Maya', gender: 'girl', meaning: 'illusion; divine creative power' }, { name: 'Madhav', gender: 'boy', meaning: 'a name of Krishna' }],
  Mi: [{ name: 'Mira', gender: 'girl', meaning: 'the devotee-saint Mirabai; ocean' }, { name: 'Mihir', gender: 'boy', meaning: 'the sun' }],
  Mu: [{ name: 'Mukul', gender: 'boy', meaning: 'a bud, a blossom' }, { name: 'Mukta', gender: 'girl', meaning: 'a pearl; liberated' }],
  Me: [{ name: 'Meera', gender: 'girl', meaning: 'the devotee of Krishna' }, { name: 'Megh', gender: 'boy', meaning: 'a cloud' }],
  Mo: [{ name: 'Mohan', gender: 'boy', meaning: 'charming; a name of Krishna' }, { name: 'Mohini', gender: 'girl', meaning: 'enchanting' }],
  // Ta / Ti / Tu / Te / To / Tha / Tra
  Ta: [{ name: 'Tara', gender: 'girl', meaning: 'a star' }, { name: 'Tanish', gender: 'boy', meaning: 'ambition' }, { name: 'Tanvi', gender: 'girl', meaning: 'slender, delicate' }],
  Ti: [{ name: 'Tilak', gender: 'boy', meaning: 'the auspicious mark on the forehead' }],
  Tu: [{ name: 'Tushar', gender: 'boy', meaning: 'snow, frost' }, { name: 'Tulsi', gender: 'girl', meaning: 'the sacred basil plant' }],
  Te: [{ name: 'Tejas', gender: 'boy', meaning: 'brilliance, radiance' }, { name: 'Tejal', gender: 'girl', meaning: 'lustrous' }],
  To: [],
  Tha: [],
  Tra: [],
  // Pa / Pi / Pu / Pe / Po / Pha
  Pa: [{ name: 'Parth', gender: 'boy', meaning: 'a name of Arjuna' }, { name: 'Pallavi', gender: 'girl', meaning: 'new leaves, a sprout' }, { name: 'Pavan', gender: 'boy', meaning: 'the wind; pure' }],
  Pi: [{ name: 'Piyush', gender: 'boy', meaning: 'nectar' }, { name: 'Piya', gender: 'girl', meaning: 'beloved' }],
  Pu: [{ name: 'Puneet', gender: 'boy', meaning: 'pure, holy' }, { name: 'Puja', gender: 'girl', meaning: 'worship, prayer' }],
  Pe: [], Po: [],
  Pha: [],
  // Sha / Sa / Si / Su / Se / So
  Sha: [{ name: 'Shaurya', gender: 'boy', meaning: 'bravery, valour' }, { name: 'Shalini', gender: 'girl', meaning: 'modest, well-behaved' }, { name: 'Sharv', gender: 'boy', meaning: 'a name of Shiva' }],
  Sa: [{ name: 'Sahil', gender: 'boy', meaning: 'the shore, a guide' }, { name: 'Saanvi', gender: 'girl', meaning: 'goddess Lakshmi' }, { name: 'Samarth', gender: 'boy', meaning: 'capable, powerful' }],
  Si: [{ name: 'Siddharth', gender: 'boy', meaning: 'one who has achieved a goal' }, { name: 'Simran', gender: 'girl', meaning: 'remembrance of God' }],
  Su: [{ name: 'Suresh', gender: 'boy', meaning: 'ruler of the gods (Indra)' }, { name: 'Sunita', gender: 'girl', meaning: 'well-mannered, righteous' }, { name: 'Suhani', gender: 'girl', meaning: 'pleasant, lovely' }],
  Se: [], So: [{ name: 'Sohan', gender: 'boy', meaning: 'charming, handsome' }, { name: 'Sonal', gender: 'girl', meaning: 'golden' }],
  // Na / Ni / Nu / Ne / No
  Na: [{ name: 'Nakul', gender: 'boy', meaning: 'the youngest Pandava' }, { name: 'Nandini', gender: 'girl', meaning: 'joyful; a sacred cow' }, { name: 'Naina', gender: 'girl', meaning: 'the eyes' }],
  Ni: [{ name: 'Nikhil', gender: 'boy', meaning: 'complete, whole' }, { name: 'Nisha', gender: 'girl', meaning: 'the night' }, { name: 'Niraj', gender: 'boy', meaning: 'the lotus' }],
  Nu: [{ name: 'Nutan', gender: 'unisex', meaning: 'new, fresh' }],
  Ne: [{ name: 'Neha', gender: 'girl', meaning: 'love, affection' }, { name: 'Neel', gender: 'boy', meaning: 'blue; sapphire' }],
  No: [],
  // Ya / Yi / Yu / Ye / Yo
  Ya: [{ name: 'Yash', gender: 'boy', meaning: 'fame, success' }, { name: 'Yamini', gender: 'girl', meaning: 'the night' }],
  Yi: [], Yu: [{ name: 'Yuvan', gender: 'boy', meaning: 'youthful' }], Ye: [], Yo: [{ name: 'Yogesh', gender: 'boy', meaning: 'lord of yoga (Shiva)' }],
  // Bha / Bhi / Bhu / Bhe / Bho
  Bha: [{ name: 'Bhavya', gender: 'unisex', meaning: 'grand, magnificent' }, { name: 'Bharat', gender: 'boy', meaning: 'to be maintained; India' }],
  Bhi: [], Bhu: [{ name: 'Bhumi', gender: 'girl', meaning: 'the earth' }], Bhe: [], Bho: [],
  // Dha
  Dha: [{ name: 'Dhruv', gender: 'boy', meaning: 'the pole star; constant' }, { name: 'Dhara', gender: 'girl', meaning: 'a stream; the earth' }],
  // Ja / Ji / Jha
  Ja: [{ name: 'Jay', gender: 'boy', meaning: 'victory' }, { name: 'Janya', gender: 'girl', meaning: 'life, born' }],
  Ji: [{ name: 'Jitesh', gender: 'boy', meaning: 'lord of victory' }],
  // Ga / Gi / Gu / Ge / Go
  Ga: [{ name: 'Gaurav', gender: 'boy', meaning: 'pride, honour' }, { name: 'Gauri', gender: 'girl', meaning: 'fair; goddess Parvati' }],
  Gi: [{ name: 'Girish', gender: 'boy', meaning: 'lord of the mountain (Shiva)' }],
  Gu: [{ name: 'Gunjan', gender: 'unisex', meaning: 'the humming of a bee' }],
  Ge: [], Go: [{ name: 'Gopal', gender: 'boy', meaning: 'the cowherd; Krishna' }, { name: 'Gomati', gender: 'girl', meaning: 'a sacred river' }],
  // Khi / Khu / Khe / Kho
  Khi: [], Khu: [], Khe: [], Kho: [],
  // Ra / Ri / Ru / Re / Ro
  Ra: [{ name: 'Rahul', gender: 'boy', meaning: 'conqueror of miseries; son of the Buddha' }, { name: 'Radha', gender: 'girl', meaning: 'the beloved of Krishna; prosperity' }, { name: 'Rohan', gender: 'boy', meaning: 'ascending; sandalwood' }],
  Ri: [{ name: 'Riya', gender: 'girl', meaning: 'a singer; graceful' }, { name: 'Rishi', gender: 'boy', meaning: 'a sage' }],
  Ru: [{ name: 'Ruchi', gender: 'girl', meaning: 'interest, lustre' }, { name: 'Rudra', gender: 'boy', meaning: 'a fierce form of Shiva' }],
  Re: [{ name: 'Rehan', gender: 'boy', meaning: 'sweet basil; a bunch of flowers' }],
  Ro: [{ name: 'Rohit', gender: 'boy', meaning: 'red; the first ray of the sun' }, { name: 'Roshni', gender: 'girl', meaning: 'light, brightness' }],
  // Cha / Chi / Chu / Che / Cho
  Cha: [{ name: 'Chaitanya', gender: 'boy', meaning: 'consciousness, awareness' }, { name: 'Charvi', gender: 'girl', meaning: 'a beautiful woman' }],
  Chi: [{ name: 'Chirag', gender: 'boy', meaning: 'a lamp, light' }],
  Chu: [], Che: [], Cho: [],
  // La / Li / Lu / Le / Lo
  La: [{ name: 'Lakshya', gender: 'boy', meaning: 'aim, target' }, { name: 'Lavanya', gender: 'girl', meaning: 'grace, beauty' }],
  Li: [], Lu: [], Le: [], Lo: [],
};

/** Names for a syllable (empty array if none curated yet). */
export function namesFor(akshara: string): BabyName[] {
  return NAMES_BY_AKSHARA[akshara] || [];
}
