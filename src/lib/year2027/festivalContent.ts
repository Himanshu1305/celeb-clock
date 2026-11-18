/**
 * B14 — what each festival is and how it is observed (static text; the DATES and TIMES on
 * the pages are computed — see ./festivalData.ts). Kept to widely documented, mainstream
 * descriptions; where customs differ by region the text says so. `more` points to a
 * general reference for further reading and, where BornClock has one, the vrat katha /
 * puja vidhi page (src/lib/vedic/vrats/content.ts — sourced).
 */

export interface FestivalText {
  /** 2–3 sentence "what it is" */
  what: string[];
  /** how it is observed — short bullets */
  observed: string[];
  /** regional names / forms */
  regional: string[];
  /** related observances: label + internal path */
  related: Array<{ label: string; to: string }>;
  /** 2–3 static questions (the computed date / time questions are added by the page) */
  faq: Array<{ q: string; a: string }>;
  /** further reading (general reference) */
  more: { label: string; url: string };
}

const W = (t: string) => ({ label: `Wikipedia — ${t.replace(/_/g, ' ')}`, url: `https://en.wikipedia.org/wiki/${t}` });

export const FESTIVAL_TEXT_EN: Record<string, FestivalText> = {
  'lohri': {
    what: ['Lohri is the Punjabi winter bonfire festival, kept on the evening before Makar Sankranti. It marks the end of the coldest part of winter and the harvest of the rabi season’s sugarcane, and is celebrated across Punjab, Haryana, Himachal Pradesh, Jammu and Delhi.', 'Families and neighbours gather round a bonfire after sunset, offer sesame, jaggery sweets, peanuts and popcorn to the fire, and sing traditional Lohri songs.'],
    observed: ['A bonfire is lit after sunset and people walk around it, offering til (sesame), rewri, gajak, peanuts and popcorn.', 'Folk songs are sung — many of them about Dulla Bhatti, a folk hero of Punjab.', 'Bhangra and giddha dances around the fire.', 'The first Lohri of a newborn child or a newly married couple is celebrated with special warmth.'],
    regional: ['Punjab, Haryana, Himachal Pradesh, Jammu and Delhi: Lohri', 'The next day is Makar Sankranti, called Maghi in Punjab'],
    related: [{ label: 'Makar Sankranti 2027', to: '/festivals/2027/makar-sankranti/' }],
    faq: [{ q: 'Is Lohri always one day before Makar Sankranti?', a: 'Yes. Lohri is kept on the evening before the Makar Sankranti festival day. Because Makar Sankranti follows the Sun’s entry into sidereal Capricorn, both dates can shift by a day from year to year.' }],
    more: W('Lohri'),
  },
  'makar-sankranti': {
    what: ['Makar Sankranti marks the Sun’s entry into Makara (sidereal Capricorn). Unlike most Hindu festivals it follows the Sun, not the Moon, so it falls on 14 or 15 January almost every year. It is traditionally linked with the start of Uttarayana, the Sun’s northward journey, and with the winter harvest.', 'It is celebrated all over India under different names, with holy dips, charity, sesame-and-jaggery sweets and, in western India, kite flying.'],
    observed: ['A holy bath at sunrise — in a river such as the Ganga where possible — during the punya kaal.', 'Daan (charity): sesame, jaggery, rice, blankets and food given to those in need.', 'Sweets of til (sesame) and gud (jaggery); in Maharashtra people exchange til-gul with the words "til-gul ghya, god god bola".', 'Kite flying, especially in Gujarat (Uttarayan).', 'Khichdi is cooked and donated in Uttar Pradesh and Bihar.'],
    regional: ['Tamil Nadu: Pongal', 'Gujarat: Uttarayan', 'Assam: Magh Bihu (Bhogali Bihu)', 'Punjab: Maghi', 'West Bengal: Poush Sankranti', 'Uttar Pradesh and Bihar: Khichdi', 'Karnataka, Andhra Pradesh, Telangana: Sankranti'],
    related: [{ label: 'Lohri 2027', to: '/festivals/2027/lohri/' }, { label: 'All Sankrantis of 2027', to: '/festivals/2027/' }],
    faq: [{ q: 'Why does the Makar Sankranti date sometimes move by a day?', a: 'The festival follows the exact moment the Sun enters sidereal Capricorn. When that moment is after sunset, the festival and its punya kaal move to the next day — and the computed moment above shows whether that is the case in 2027.' }, { q: 'Is Makar Sankranti a solar or lunar festival?', a: 'Solar. It follows the Sun’s movement, which is why its Gregorian date barely changes, while lunar festivals such as Holi or Diwali move by up to a month.' }],
    more: W('Makar_Sankranti'),
  },
  'vasant-panchami': {
    what: ['Vasant Panchami, on Magha Shukla Panchami, welcomes the spring season and is dedicated to Goddess Saraswati, the deity of learning, music and the arts. In eastern India it is celebrated as Saraswati Puja.', 'Yellow — the colour of mustard fields in bloom — is worn and offered, and many families choose this day to start a child’s education.'],
    observed: ['Saraswati puja in homes, schools and colleges, with books, pens and instruments placed before the goddess.', 'Yellow clothes, yellow flowers and yellow sweets.', 'Vidyarambh / Akshar Abhyasam — a young child writes its first letters.', 'Kite flying in parts of Punjab and north India.'],
    regional: ['West Bengal, Odisha, Assam, Bihar: Saraswati Puja', 'North India: Vasant / Basant Panchami', 'Also called Shri Panchami'],
    related: [{ label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }],
    faq: [{ q: 'Why is Saraswati worshipped on Vasant Panchami?', a: 'Tradition holds this Panchami as the day of Saraswati, goddess of knowledge and the arts, so students, musicians and artists pray for learning and clarity on it.' }],
    more: W('Vasant_Panchami'),
  },
  'mahashivratri': {
    what: ['Mahashivratri, “the great night of Shiva”, is kept on the Chaturdashi (14th day) of the dark fortnight of Phalguna in the North Indian calendar (Magha in the amanta calendar). It is one of the most important nights for devotees of Shiva.', 'Devotees fast, keep a night-long vigil and worship the Shiva linga through the four prahars (quarters) of the night; the most important worship is at Nishita kaal, around midnight.'],
    observed: ['A fast — complete, or with fruit and milk — from morning until the next day.', 'Abhisheka of the Shiva linga with water, milk, curd, honey and ghee, and offerings of bel (bilva) leaves.', 'Chanting of “Om Namah Shivaya” and night-long jagaran with bhajans.', 'Worship in each of the four prahars of the night, with the main puja at Nishita kaal.'],
    regional: ['Kashmir: Herath (Shivratri of the Kashmiri Pandits)', 'Pan-Indian: Maha Shivaratri, Shivaratri'],
    related: [{ label: 'Mahashivratri vrat katha & puja vidhi', to: '/vrat/mahashivratri/' }, { label: 'Pradosh Vrat', to: '/vrat/pradosh-vrat/' }],
    faq: [{ q: 'What is the difference between Shivratri and Mahashivratri?', a: 'A Masik (monthly) Shivratri falls on every Krishna Chaturdashi. Mahashivratri is the one in Phalguna (purnimanta) — the most important of the year.' }, { q: 'When is the Mahashivratri fast broken?', a: 'Traditionally the next morning, after sunrise and before the Chaturdashi tithi ends where possible. Families follow their own custom.' }],
    more: W('Maha_Shivaratri'),
  },
  'holika-dahan': {
    what: ['Holika Dahan is the bonfire lit on the evening of Phalguna Purnima, the night before Holi. It recalls the story of the young devotee Prahlad, who survived the fire, while his aunt Holika — who tried to burn him at the command of his father, the demon king Hiranyakashipu — perished.', 'It symbolises the victory of devotion and good over evil, and is also called Chhoti Holi.'],
    observed: ['A pyre of wood and cow-dung cakes is built in a public place in the days before.', 'In the evening it is worshipped (Holika puja) and lit at the auspicious time, avoiding Bhadra.', 'People walk around the fire, offering coconut, new grain, and roli-rice.', 'Ash from the fire is sometimes taken home as a blessing.'],
    regional: ['North India: Holika Dahan, Chhoti Holi', 'South India: Kama Dahanam'],
    related: [{ label: 'Holi 2027', to: '/festivals/2027/holi/' }, { label: 'Purnima dates 2027', to: '/purnima-2027/' }],
    faq: [{ q: 'Why is Holika Dahan not done during Bhadra?', a: 'Bhadra (the Vishti karana, the first half of Purnima) is traditionally considered unsuitable for auspicious acts, so the bonfire is lit when Bhadra is over — or, when Bhadra covers the whole evening, at the time a local Panchang specifies.' }],
    more: W('Holika_Dahan'),
  },
  'holi': {
    what: ['Holi, the festival of colours, is celebrated on the morning after Holika Dahan, at the end of the lunar month of Phalguna. It welcomes spring and celebrates the victory of good over evil and the playful love of Radha and Krishna.', 'People throw coloured powder (gulal) and water at each other, visit friends and family, and share sweets such as gujiya — and differences are traditionally set aside for the day.'],
    observed: ['Playing with dry gulal and coloured water from the morning until about noon.', 'Visiting relatives and friends; sharing gujiya, malpua and thandai.', 'Music, drums and dancing in streets and courtyards.', 'In the Braj region (Mathura, Vrindavan, Barsana, Nandgaon) celebrations run for days, including Lathmar Holi.'],
    regional: ['West Bengal and Odisha: Dol Jatra / Dol Purnima (Basanta Utsav)', 'Maharashtra and Madhya Pradesh: Rang Panchami five days later', 'Goa: Shigmo', 'Uttar Pradesh: Lathmar Holi in Barsana and Nandgaon', 'Caribbean and Fiji Indian communities: Phagwah'],
    related: [{ label: 'Holika Dahan 2027', to: '/festivals/2027/holika-dahan/' }, { label: 'Chaitra Navratri 2027', to: '/festivals/2027/chaitra-navratri/' }],
    faq: [{ q: 'Is Holi on Purnima?', a: 'Holika Dahan is on the evening of Phalguna Purnima; Holi (Dhulandi), the day of colours, is the next day.' }, { q: 'How can I play Holi safely?', a: 'Prefer natural or skin-safe colours, protect eyes and hair, keep water play moderate and stay hydrated — and respect people who prefer not to be coloured.' }],
    more: W('Holi'),
  },
  'ugadi-gudi-padwa': {
    what: ['Chaitra Shukla Pratipada, the first day of the bright half of Chaitra, is the lunisolar New Year in much of western and southern India: Ugadi (Yugadi) in Karnataka, Andhra Pradesh and Telangana, and Gudi Padwa in Maharashtra and Goa.', 'The same day begins Chaitra Navratri in north India.'],
    observed: ['Gudi Padwa: a gudi — a bright cloth on a bamboo pole topped with an inverted pot, neem leaves and a sugar garland — is raised outside the home.', 'Ugadi: Ugadi pachadi, a dish of six tastes (sweet, sour, salty, bitter, pungent, astringent) that stands for the mix of experiences the year will bring.', 'Oil bath, new clothes, mango-leaf torans and rangoli.', 'Panchanga Shravanam — listening to the reading of the new year’s almanac.'],
    regional: ['Karnataka, Andhra Pradesh, Telangana: Ugadi / Yugadi', 'Maharashtra and Goa: Gudi Padwa', 'North India: first day of Chaitra Navratri (Vikram Samvat new year)'],
    related: [{ label: 'Chaitra Navratri 2027', to: '/festivals/2027/chaitra-navratri/' }, { label: 'Ram Navami 2027', to: '/festivals/2027/ram-navami/' }],
    faq: [{ q: 'Are Ugadi and Gudi Padwa the same day?', a: 'Yes — both are Chaitra Shukla Pratipada, the lunar new year, celebrated with different customs in the south and in Maharashtra.' }],
    more: W('Ugadi'),
  },
  'chaitra-navratri': {
    what: ['Chaitra Navratri (Vasanta Navratri) is the nine-night festival of Goddess Durga in the spring month of Chaitra, from Shukla Pratipada to Navami. Each day honours one of the nine forms of Durga (Navadurga).', 'It begins with Ghatasthapana — installing a sacred kalash — and ends with Ram Navami on the ninth day.'],
    observed: ['Ghatasthapana on the first morning, in the auspicious window while Pratipada prevails.', 'Daily worship of the nine forms: Shailaputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri and Siddhidatri.', 'Fasting for all nine days or on the first and last days.', 'Kanya puja (worship of young girls) on Ashtami or Navami.'],
    regional: ['North India: Chaitra Navratri / Vasanta Navratri', 'The first day is Ugadi / Gudi Padwa in the south and west'],
    related: [{ label: 'Navratri vrat katha & puja vidhi', to: '/vrat/navratri/' }, { label: 'Ram Navami 2027', to: '/festivals/2027/ram-navami/' }, { label: 'Sharad Navratri 2027', to: '/festivals/2027/navratri/' }],
    faq: [{ q: 'How is Chaitra Navratri different from Sharad Navratri?', a: 'Both are nine nights of Durga worship. Chaitra Navratri is in spring and ends with Ram Navami; Sharad Navratri, the bigger festival, is in autumn (Ashwina) and ends with Dussehra.' }],
    more: W('Navaratri'),
  },
  'ram-navami': {
    what: ['Ram Navami celebrates the birth of Lord Rama, kept on Chaitra Shukla Navami — the ninth day of Chaitra Navratri. Tradition holds that Rama was born at midday, so the main puja is in the Madhyahna (midday) period.', 'Temples across India hold special worship, and Ayodhya, Rama’s birthplace, sees large celebrations.'],
    observed: ['Midday puja, often with a cradle for the infant Rama.', 'Reading or listening to the Ramayana or Ramcharitmanas; bhajans and kirtan.', 'Fasting until the midday puja or for the whole day.', 'Shobha yatras (processions) in many towns.'],
    regional: ['Telangana: Sita Rama Kalyanam at Bhadrachalam', 'Pan-Indian: Rama Navami, Sri Rama Navami'],
    related: [{ label: 'Chaitra Navratri 2027', to: '/festivals/2027/chaitra-navratri/' }, { label: 'Hanuman Jayanti 2027', to: '/festivals/2027/hanuman-jayanti/' }],
    faq: [{ q: 'Why does Ram Navami sometimes differ by a day between calendars?', a: 'The date is the day Navami covers the midday period. When Navami spans two middays the traditions choose differently — Smarta calendars (as here) and Vaishnava / ISKCON lists can differ by a day.' }],
    more: W('Rama_Navami'),
  },
  'hanuman-jayanti': {
    what: ['Hanuman Jayanti celebrates the birth of Lord Hanuman. In north India it is kept on Chaitra Purnima, the full moon after Ram Navami — the date given on this page.', 'Devotees visit Hanuman temples from early morning, recite the Hanuman Chalisa and Sundar Kand, and offer sindoor and sweets.'],
    observed: ['Early-morning temple visits and Hanuman puja.', 'Recitation of the Hanuman Chalisa, Bajrang Baan or the Sundar Kand of the Ramayana.', 'Offering sindoor mixed with oil, and laddoos or boondi.', 'Fasting by some devotees.'],
    regional: ['North India: Chaitra Purnima (this date)', 'Some southern states keep Hanuman Jayanti on other dates — for example in the Tamil month of Margazhi'],
    related: [{ label: 'Mangalvar Hanuman vrat', to: '/vrat/mangalvar-vrat/' }, { label: 'Ram Navami 2027', to: '/festivals/2027/ram-navami/' }],
    faq: [{ q: 'Why do some states celebrate Hanuman Jayanti on a different date?', a: 'Regional traditions follow different texts and calendars. North India keeps Chaitra Purnima; parts of south India observe it in other months.' }],
    more: W('Hanuman_Jayanti'),
  },
  'akshaya-tritiya': {
    what: ['Akshaya Tritiya, on Vaishakha Shukla Tritiya, is considered one of the most auspicious days of the year: “akshaya” means never diminishing, and good deeds and beginnings on this day are traditionally said to bring lasting results.', 'It is a favoured day for new ventures, weddings and charity, and many people buy gold. It is also kept as Parashurama Jayanti, and Jains associate the day with Rishabhanatha’s first meal after his long fast.'],
    observed: ['Worship of Vishnu and Lakshmi.', 'Daan — food, water pots, clothes and grain given to those in need.', 'Starting new work, a business or a home project.', 'Buying gold or other valuables is a popular custom — entirely optional.'],
    regional: ['Pan-Indian: Akshaya Tritiya, Akha Teej (Rajasthan, Gujarat)', 'Also Parashurama Jayanti'],
    related: [{ label: 'Muhurat calendar 2027', to: '/muhurat/' }],
    faq: [{ q: 'Do I need to buy gold on Akshaya Tritiya?', a: 'No. The tradition is about beginnings and giving; buying gold is a popular custom, not a requirement. Charity and good work are the heart of the day.' }],
    more: W('Akshaya_Tritiya'),
  },
  'guru-purnima': {
    what: ['Guru Purnima, on Ashadha Purnima, honours teachers and spiritual guides. It is also called Vyasa Purnima, as the day is linked with Veda Vyasa, the sage credited with compiling the Vedas and the Mahabharata.', 'Students and disciples offer respect and thanks to their teachers; Buddhists also mark this full moon as the day of the Buddha’s first sermon at Sarnath.'],
    observed: ['Guru puja — paying respects to a teacher, a spiritual guide or the memory of one.', 'Reading or listening to sacred texts and discourses.', 'Fasting or a simple meal; charity.', 'Many ashrams and institutions hold gatherings.'],
    regional: ['Also called Vyasa Purnima', 'Buddhist tradition: Asalha Puja'],
    related: [{ label: 'Purnima dates 2027', to: '/purnima-2027/' }, { label: 'Satyanarayan katha (Purnima)', to: '/vrat/satyanarayan-katha/' }],
    faq: [{ q: 'Why is Guru Purnima also called Vyasa Purnima?', a: 'The full moon of Ashadha is traditionally associated with Veda Vyasa, regarded as one of the greatest teachers in the tradition.' }],
    more: W('Guru_Purnima'),
  },
  'nag-panchami': {
    what: ['Nag Panchami, on Shravana Shukla Panchami, is devoted to the Nagas, the serpent deities of Hindu tradition. Images of nagas are worshipped with milk, flowers and turmeric, and families pray for protection and well-being.', 'Some regions keep the festival on the Krishna-paksha Panchami of the month instead.'],
    observed: ['Worship of naga images or drawings in the forenoon (Purvahna).', 'Offering milk, flowers, rice and turmeric to the images.', 'In many places people avoid digging the earth on this day.', 'Please don’t feed milk to live snakes — wildlife experts advise against it; offer it to images instead.'],
    regional: ['Pan-Indian: Nag Panchami', 'Some regions observe it in the dark fortnight of Shravana'],
    related: [{ label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }],
    faq: [{ q: 'Which Naga deities are worshipped on Nag Panchami?', a: 'Traditionally the great serpents of the Puranas — such as Ananta (Shesha), Vasuki and Takshaka — are remembered, along with local snake deities.' }],
    more: W('Nag_Panchami'),
  },
  'raksha-bandhan': {
    what: ['Raksha Bandhan, on Shravana Purnima, celebrates the bond between brothers and sisters. A sister ties a rakhi — a sacred thread — on her brother’s wrist and prays for his well-being; he promises to protect her and gives a gift.', 'Tradition avoids tying the rakhi during Bhadra, the first half of Purnima, so the time of day matters.'],
    observed: ['A thali with rakhi, roli, rice, a diya and sweets is prepared.', 'The sister applies tilak, ties the rakhi, does aarti and feeds the brother a sweet.', 'The brother gives a gift and a promise of support.', 'Today rakhis are also tied between cousins, friends and sisters.'],
    regional: ['Maharashtra coast: Narali Purnima (coconut offered to the sea), on the same full moon', 'South India: Avani Avittam (Upakarma, the renewal of the sacred thread) around this full moon', 'West Bengal and Odisha: Jhulan Purnima'],
    related: [{ label: 'Purnima dates 2027', to: '/purnima-2027/' }, { label: 'Janmashtami 2027', to: '/festivals/2027/janmashtami/' }],
    faq: [{ q: 'Why is the rakhi not tied during Bhadra?', a: 'Bhadra (Vishti karana) is traditionally considered unsuitable for auspicious acts. The computed rakhi time above starts only after Bhadra has ended and lasts while Purnima prevails.' }],
    more: W('Raksha_Bandhan'),
  },
  'janmashtami': {
    what: ['Krishna Janmashtami celebrates the birth of Lord Krishna, believed to have been born at midnight on Ashtami (the 8th day) of the dark fortnight of Bhadrapada (North Indian calendar). The main puja is therefore at Nishita kaal, around midnight.', 'Devotees fast through the day, decorate a cradle for the infant Krishna and break the fast after the midnight puja; Mathura and Vrindavan hold the most famous celebrations.'],
    observed: ['A fast from morning until the midnight puja (or until the next morning).', 'Abhisheka of the infant Krishna with panchamrit at midnight, then rocking the jhula (cradle).', 'Bhajans, kirtan and tableaux of Krishna’s childhood (jhankis).', 'Dahi Handi / Gopalkala the next day in Maharashtra.'],
    regional: ['Maharashtra: Gokulashtami and Dahi Handi', 'Kerala: Ashtami Rohini', 'South India: Sri Krishna Jayanti', 'Gujarat: Janmashtami with Dwarka and Dakor temple festivities'],
    related: [{ label: 'Janmashtami vrat katha & puja vidhi', to: '/vrat/janmashtami/' }, { label: 'Raksha Bandhan 2027', to: '/festivals/2027/raksha-bandhan/' }],
    faq: [{ q: 'Why are there sometimes two Janmashtami dates?', a: 'Smarta calendars (as here) and Vaishnava / ISKCON calendars apply different rules about Ashtami and Rohini nakshatra, so they can differ by a day.' }],
    more: W('Krishna_Janmashtami'),
  },
  'ganesh-chaturthi': {
    what: ['Ganesh Chaturthi, on Bhadrapada Shukla Chaturthi, celebrates the birth of Lord Ganesha. Clay images of Ganesha are installed at home and in public pandals and worshipped for one and a half to ten days.', 'The main puja is at midday (Madhyahna), when Ganesha is traditionally believed to have been born. The festival ends with immersion (visarjan), the last on Anant Chaturdashi.'],
    observed: ['Installation (sthapana) of a clay Ganesha at the midday muhurat.', 'Offering modaks, durva grass and red flowers; daily aarti.', 'Visarjan after 1½, 3, 5, 7 or 10 days.', 'Tradition advises not looking at the Moon on the night of Chaturthi.'],
    regional: ['Maharashtra: Ganeshotsav — public celebrations popularised by Lokmanya Tilak in the 1890s', 'South India: Vinayaka Chaturthi', 'Goa: Chavath'],
    related: [{ label: 'Sankashti Chaturthi', to: '/vrat/sankashti-chaturthi/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }],
    faq: [{ q: 'When should the Ganesha idol be installed?', a: 'In the Madhyahna (midday) window while Chaturthi lasts — the puja time shown above for New Delhi.' }],
    more: W('Ganesh_Chaturthi'),
  },
  'navratri': {
    what: ['Sharad Navratri, the nine nights of Goddess Durga in the autumn month of Ashwina, is the biggest Navratri of the year. Each day honours one of the nine forms of Durga, and the festival ends with Vijayadashami (Dussehra) on the tenth day.', 'It begins with Ghatasthapana — installing a kalash — in the morning window of Pratipada.'],
    observed: ['Ghatasthapana on the first morning in the muhurat while Pratipada prevails.', 'Worship of a different form of Durga each day; many people fast for all nine days.', 'Garba and Dandiya dances in Gujarat and beyond.', 'Kanya puja on Ashtami or Navami.'],
    regional: ['West Bengal and eastern India: Durga Puja (Shashthi to Dashami)', 'Gujarat: Navratri with Garba and Dandiya', 'Tamil Nadu: Golu (Bommai Kolu)', 'Karnataka: Mysuru Dasara'],
    related: [{ label: 'Navratri vrat katha & puja vidhi', to: '/vrat/navratri/' }, { label: 'Maha Navami 2027', to: '/festivals/2027/maha-navami/' }, { label: 'Dussehra 2027', to: '/festivals/2027/dussehra/' }],
    faq: [{ q: 'What are the nine forms of Durga worshipped in Navratri?', a: 'Shailaputri, Brahmacharini, Chandraghanta, Kushmanda, Skandamata, Katyayani, Kalaratri, Mahagauri and Siddhidatri — one on each day.' }],
    more: W('Navaratri'),
  },
  'maha-navami': {
    what: ['Maha Navami is the ninth day of Sharad Navratri, dedicated to Goddess Siddhidatri, the last of the nine forms of Durga. In Durga Puja it is one of the most important days, preceded by the Sandhi Puja at the junction of Ashtami and Navami.', 'States follow two rules to choose the day, which is why Bengal and north India can keep Maha Navami on different dates.'],
    observed: ['Worship of Siddhidatri and kanya puja (worship of young girls).', 'Havan to complete the Navratri worship in many homes.', 'Ayudha Puja in south India — tools, vehicles and instruments are cleaned and worshipped.', 'Durga Puja Navami rituals in Bengal.'],
    regional: ['South India: Ayudha Puja', 'Bengal: Maha Nabami', 'North India: Navami of Navratri'],
    related: [{ label: 'Navratri 2027', to: '/festivals/2027/navratri/' }, { label: 'Dussehra 2027', to: '/festivals/2027/dussehra/' }],
    faq: [{ q: 'Why does Maha Navami differ between Bengal and north India?', a: 'Most states follow the Purva-Viddha rule (Navami for at least three muhurtas before sunset — the earlier day); Bengal follows the Para-Viddha rule (Navami for at least one muhurta after sunrise). In 2027 they give different days — both are shown above.' }],
    more: W('Navaratri'),
  },
  'dussehra': {
    what: ['Dussehra, or Vijayadashami, on Ashwina Shukla Dashami, celebrates the victory of good over evil — Lord Rama’s victory over Ravana and Goddess Durga’s victory over the buffalo demon Mahishasura. It is the tenth day after Navratri.', 'Effigies of Ravana, Meghnad and Kumbhakarna are burnt at the end of the Ram Lila in north India, while in Bengal the Durga images are immersed.'],
    observed: ['Ram Lila performances and the burning of Ravana effigies in the evening.', 'Shami and Aparajita puja; exchanging shami / apta leaves as “gold” in Maharashtra.', 'Starting new learning or ventures — in Kerala children begin their letters (Vidyarambham).', 'Durga visarjan and Sindoor Khela in Bengal.'],
    regional: ['Karnataka: Mysuru Dasara procession', 'Himachal Pradesh: Kullu Dussehra', 'West Bengal: Bijoya Dashami', 'Kerala: Vidyarambham'],
    related: [{ label: 'Navratri 2027', to: '/festivals/2027/navratri/' }, { label: 'Diwali 2027', to: '/festivals/2027/diwali/' }],
    faq: [{ q: 'Is Dussehra the same as Vijayadashami?', a: 'Yes — two names for Ashwina Shukla Dashami, the day after Navratri.' }],
    more: W('Vijayadashami'),
  },
  'karwa-chauth': {
    what: ['Karwa Chauth is a fast kept by married women — and increasingly by couples — for the well-being and long life of their spouse, on Kartika Krishna Chaturthi (North Indian calendar). It is widely observed in Punjab, Haryana, Rajasthan, Uttar Pradesh and Delhi.', 'The fast runs from before sunrise until the Moon rises; it is broken after seeing the Moon and offering it water.'],
    observed: ['Sargi — a pre-dawn meal, often given by the mother-in-law.', 'A day-long fast, traditionally without food or water.', 'An evening puja with the karwa (an earthen pot) and the Karwa Chauth katha.', 'At moonrise the Moon is seen through a sieve, arghya is offered and the fast is broken.'],
    regional: ['Punjab, Haryana, Rajasthan, Uttar Pradesh, Delhi: Karwa Chauth / Karva Chauth', 'Andhra Pradesh: Atla Taddi is a related women’s observance'],
    related: [{ label: 'Karwa Chauth vrat katha & puja vidhi', to: '/vrat/karwa-chauth/' }, { label: 'Sankashti Chaturthi', to: '/vrat/sankashti-chaturthi/' }],
    faq: [{ q: 'Why does moonrise time differ by city?', a: 'Moonrise depends on where you are. The time above is for New Delhi; in other cities the Moon can rise several minutes to over half an hour earlier or later.' }],
    more: W('Karva_Chauth'),
  },
  'dhanteras': {
    what: ['Dhanteras, on Kartika Krishna Trayodashi (North Indian calendar), opens the five days of Diwali. It honours Lord Dhanvantari, the physician of the gods and the deity of Ayurveda, and Goddess Lakshmi; India marks National Ayurveda Day on Dhanteras.', 'Buying gold, silver or new utensils is a popular custom, and Lakshmi and Kubera are worshipped in the evening.'],
    observed: ['Cleaning and decorating the home; lighting diyas.', 'Lakshmi–Kubera puja in the evening (Pradosh kaal).', 'Yama Deepam — a lamp lit facing south in the evening.', 'Buying metal utensils or jewellery — a custom, not a requirement.'],
    regional: ['Also called Dhantrayodashi and Dhanvantari Jayanti'],
    related: [{ label: 'Diwali 2027', to: '/festivals/2027/diwali/' }, { label: 'Govardhan Puja 2027', to: '/festivals/2027/govardhan-puja/' }],
    faq: [{ q: 'Is Dhanteras two days before Diwali?', a: 'Usually, yes — Trayodashi, then Chaturdashi (Narak Chaturdashi / Choti Diwali), then Amavasya (Diwali). In 2027 Dhanteras is on {d:dhanteras} and Diwali on {d:diwali}.' }],
    more: W('Dhanteras'),
  },
  'diwali': {
    what: ['Diwali (Deepavali), the festival of lights, is celebrated on Kartika Amavasya (North Indian calendar). Homes are lit with diyas and lamps, and Goddess Lakshmi is worshipped in the evening for prosperity and well-being.', 'It recalls Lord Rama’s return to Ayodhya, and is the centre of a five-day festival from Dhanteras to Bhai Dooj. Jains mark it as the nirvana of Lord Mahavira and Sikhs celebrate Bandi Chhor Divas.'],
    observed: ['Cleaning and decorating the home; rangoli and lamps at the doorway.', 'Lakshmi–Ganesha puja in the evening, in Pradosh kaal.', 'Sharing sweets and visiting family and friends.', 'Fireworks — many families now choose quieter, cleaner celebrations.'],
    regional: ['West Bengal, Odisha, Assam: Kali Puja on the same night', 'South India: Naraka Chaturdashi is the main Deepavali day', 'Gujarat: the next day is the Gujarati New Year (Bestu Varas)'],
    related: [{ label: 'Dhanteras 2027', to: '/festivals/2027/dhanteras/' }, { label: 'Govardhan Puja 2027', to: '/festivals/2027/govardhan-puja/' }, { label: 'Bhai Dooj 2027', to: '/festivals/2027/bhai-dooj/' }, { label: 'Diwali gift report', to: '/diwali-gift/' }],
    faq: [{ q: 'What are the five days of Diwali in 2027?', a: 'Dhanteras ({d:dhanteras}), Narak Chaturdashi ({d:narak}), Diwali Lakshmi Puja ({d:diwali}), Govardhan Puja ({d:govardhan-puja}) and Bhai Dooj ({d:bhai-dooj}) — all computed for New Delhi.' }],
    more: W('Diwali'),
  },
  'govardhan-puja': {
    what: ['Govardhan Puja, on Kartika Shukla Pratipada — the day after Diwali — recalls Lord Krishna lifting the Govardhan hill to shelter the people and cattle of Braj from Indra’s storm.', 'A small “Govardhan” is shaped, often from cow dung, and worshipped, and a mountain of food — Annakut — is offered to Krishna.'],
    observed: ['Shaping and worshipping a model of Govardhan hill in the morning.', 'Annakut — many dishes offered to Krishna and then shared as prasad.', 'Worship and care of cows.', 'Parikrama of Govardhan hill near Mathura by pilgrims.'],
    regional: ['North India: Govardhan Puja, Annakut', 'Maharashtra: Bali Pratipada / Diwali Padwa', 'Gujarat: Bestu Varas (New Year)'],
    related: [{ label: 'Diwali 2027', to: '/festivals/2027/diwali/' }, { label: 'Bhai Dooj 2027', to: '/festivals/2027/bhai-dooj/' }],
    faq: [{ q: 'Is Govardhan Puja always the day after Diwali?', a: 'Usually. It follows Kartika Shukla Pratipada, and in some years the tithi timing places it two days after the Lakshmi Puja.' }],
    more: W('Govardhan_Puja'),
  },
  'bhai-dooj': {
    what: ['Bhai Dooj, on Kartika Shukla Dwitiya, closes the five days of Diwali. Sisters apply tilak on their brothers’ foreheads and pray for their long life; brothers give gifts in return.', 'The day is also called Yama Dwitiya, after the story of Yama visiting his sister Yamuna.'],
    observed: ['The sister prepares a thali and applies tilak to her brother, usually in the afternoon.', 'Aarti, sweets and a meal at the sister’s home.', 'Gifts from brother to sister.', 'A dip in the Yamuna at Mathura by some pilgrims.'],
    regional: ['Maharashtra, Goa, Karnataka: Bhau Beej', 'West Bengal: Bhai Phonta', 'Nepal: Bhai Tika (Tihar)'],
    related: [{ label: 'Diwali 2027', to: '/festivals/2027/diwali/' }, { label: 'Raksha Bandhan 2027', to: '/festivals/2027/raksha-bandhan/' }],
    faq: [{ q: 'How is Bhai Dooj different from Raksha Bandhan?', a: 'Both celebrate brothers and sisters. On Raksha Bandhan the sister ties a rakhi; on Bhai Dooj she applies a tilak and prays for her brother’s long life.' }],
    more: W('Bhai_Dooj'),
  },
  'chhath-puja': {
    what: ['Chhath Puja is a four-day festival dedicated to the Sun God (Surya) and Chhathi Maiya, celebrated mainly in Bihar, Jharkhand, eastern Uttar Pradesh and the Madhesh region of Nepal — and wherever people from these regions live.', 'Its heart is the offering of arghya (water and offerings) to the setting Sun on Kartika Shukla Shashthi and to the rising Sun the next morning, standing in a river or pond.'],
    observed: ['Day 1, Nahay Khay: a holy bath and a simple, pure meal.', 'Day 2, Kharna: a day-long fast broken in the evening with kheer and roti; then a fast without water begins.', 'Day 3, Sandhya Arghya: offerings to the setting Sun at a riverbank or pond.', 'Day 4, Usha Arghya: offerings to the rising Sun, after which the fast is broken; thekua is the traditional prasad.'],
    regional: ['Bihar, Jharkhand, eastern Uttar Pradesh, Nepal: Chhath, Chhathi, Surya Shashthi', 'A second, smaller Chhath — Chaiti Chhath — is kept in Chaitra'],
    related: [{ label: 'Diwali 2027', to: '/festivals/2027/diwali/' }, { label: 'Hindu calendar 2027', to: '/hindu-calendar-2027/' }],
    faq: [{ q: 'Is the Chhath fast without water?', a: 'Traditionally yes — after Kharna the vrati keeps a nirjala (waterless) fast until the morning arghya. Anyone with a health condition should adapt it with their doctor’s advice.' }],
    more: W('Chhath'),
  },
  'dev-uthani-ekadashi': {
    what: ['Dev Uthani Ekadashi (Prabodhini or Devutthana Ekadashi), on Kartika Shukla Ekadashi, marks Lord Vishnu’s awakening from his four-month yogic sleep, which began on Devshayani Ekadashi. It ends Chaturmas.', 'With it, the season for weddings and other auspicious ceremonies traditionally resumes, and Tulsi Vivah — the ceremonial marriage of the tulsi plant to Vishnu (Shaligram) — is performed on or after this day.'],
    observed: ['An Ekadashi fast, broken the next morning (parana).', 'Waking Vishnu with conch, bells and songs; a sugarcane mandap for the puja in many homes.', 'Tulsi Vivah on Ekadashi or Dwadashi.', 'Lighting lamps and visiting Vishnu temples.'],
    regional: ['Also called Prabodhini Ekadashi, Devutthana Ekadashi and Devuthani Gyaras', 'Maharashtra: Kartiki Ekadashi, with the Pandharpur yatra'],
    related: [{ label: 'Ekadashi vrat katha & puja vidhi', to: '/vrat/ekadashi/' }, { label: 'All Ekadashi dates 2027', to: '/ekadashi-2027/' }],
    faq: [{ q: 'Why do weddings resume after Dev Uthani Ekadashi?', a: 'During Chaturmas, when Vishnu is said to sleep, many families avoid weddings and similar ceremonies. Dev Uthani Ekadashi ends Chaturmas, so the wedding season traditionally reopens.' }],
    more: W('Prabodhini_Ekadashi'),
  },
};

/** Hindi text for the ten Hindi festival pages. */
export const FESTIVAL_TEXT_HI: Record<string, Omit<FestivalText, 'more'>> = {
  'holi': {
    what: ['होली रंगों का त्योहार है, जो होलिका दहन की अगली सुबह फाल्गुन मास के अंत में मनाया जाता है। यह वसंत के स्वागत, बुराई पर अच्छाई की जीत और राधा-कृष्ण के प्रेम का उत्सव है।', 'लोग एक-दूसरे पर गुलाल और रंग डालते हैं, रिश्तेदारों-मित्रों से मिलते हैं और गुझिया जैसी मिठाइयाँ बाँटते हैं — इस दिन पुराने मनमुटाव भुलाने की परंपरा है।'],
    observed: ['सुबह से दोपहर तक सूखे गुलाल और रंगीन पानी से होली खेलना।', 'रिश्तेदारों और मित्रों से मिलना; गुझिया, मालपुआ और ठंडाई।', 'ढोल, गीत और नाच।', 'ब्रज (मथुरा, वृंदावन, बरसाना, नंदगाँव) में कई दिन तक उत्सव, जिसमें बरसाना की लट्ठमार होली प्रसिद्ध है।'],
    regional: ['पश्चिम बंगाल और ओडिशा: दोल यात्रा / दोल पूर्णिमा', 'महाराष्ट्र और मध्य प्रदेश: पाँच दिन बाद रंग पंचमी', 'गोवा: शिगमो', 'उत्तर प्रदेश: बरसाना-नंदगाँव की लट्ठमार होली'],
    related: [{ label: 'होली 2027 (English)', to: '/festivals/2027/holi/' }, { label: 'होलिका दहन 2027', to: '/festivals/2027/holika-dahan/' }],
    faq: [{ q: 'क्या होली पूर्णिमा को होती है?', a: 'होलिका दहन फाल्गुन पूर्णिमा की शाम को होता है; रंगों वाली होली (धुलंडी) उसके अगले दिन खेली जाती है।' }, { q: 'होली सुरक्षित तरीक़े से कैसे खेलें?', a: 'प्राकृतिक या त्वचा के लिए सुरक्षित रंग चुनें, आँखों और बालों को बचाएँ, पानी सीमित रखें और जो रंग न लगवाना चाहें उनकी इच्छा का सम्मान करें।' }],
  },
  'diwali': {
    what: ['दिवाली (दीपावली) प्रकाश का पर्व है, जो कार्तिक अमावस्या (उत्तर भारतीय पंचांग) को मनाया जाता है। घरों को दीयों से सजाया जाता है और शाम को सुख-समृद्धि के लिए माँ लक्ष्मी की पूजा की जाती है।', 'यह भगवान राम के अयोध्या लौटने की स्मृति है और धनतेरस से भाई दूज तक चलने वाले पाँच दिन के उत्सव का केंद्र है। जैन धर्म में यह भगवान महावीर के निर्वाण का दिन है और सिख बंदी छोड़ दिवस मनाते हैं।'],
    observed: ['घर की सफ़ाई और सजावट; दरवाज़े पर रंगोली और दीये।', 'प्रदोष काल में लक्ष्मी-गणेश पूजा।', 'मिठाइयाँ बाँटना और परिवार-मित्रों से मिलना।', 'आतिशबाज़ी — अब कई परिवार शांत और स्वच्छ उत्सव चुनते हैं।'],
    regional: ['पश्चिम बंगाल, ओडिशा, असम: उसी रात काली पूजा', 'दक्षिण भारत: नरक चतुर्दशी मुख्य दीपावली दिवस', 'गुजरात: अगले दिन गुजराती नववर्ष (बेस्तु वरस)'],
    related: [{ label: 'दिवाली 2027 (English)', to: '/festivals/2027/diwali/' }, { label: 'धनतेरस 2027', to: '/hi/festivals/2027/dhanteras/' }],
    faq: [{ q: '2027 में दिवाली के पाँच दिन कौन से हैं?', a: 'धनतेरस ({d:dhanteras}), नरक चतुर्दशी ({d:narak}), दिवाली लक्ष्मी पूजा ({d:diwali}), गोवर्धन पूजा ({d:govardhan-puja}) और भाई दूज ({d:bhai-dooj}) — सभी नई दिल्ली के लिए गणना।' }],
  },
  'navratri': {
    what: ['शारदीय नवरात्रि आश्विन मास में माँ दुर्गा की आराधना की नौ रातें हैं — वर्ष की सबसे बड़ी नवरात्रि। हर दिन माँ के नौ रूपों में से एक की पूजा होती है और दसवें दिन विजयादशमी (दशहरा) के साथ उत्सव पूरा होता है।', 'इसकी शुरुआत प्रतिपदा की सुबह घटस्थापना — कलश स्थापना — से होती है।'],
    observed: ['पहले दिन प्रतिपदा रहते शुभ समय में घटस्थापना।', 'हर दिन माँ के एक रूप की पूजा; कई लोग नौ दिन व्रत रखते हैं।', 'गुजरात और अन्य जगहों पर गरबा और डांडिया।', 'अष्टमी या नवमी को कन्या पूजन।'],
    regional: ['पश्चिम बंगाल और पूर्वी भारत: दुर्गा पूजा (षष्ठी से दशमी)', 'गुजरात: गरबा-डांडिया वाली नवरात्रि', 'तमिलनाडु: गोलू (बोम्मई कोलू)', 'कर्नाटक: मैसूरु दशहरा'],
    related: [{ label: 'नवरात्रि व्रत कथा और पूजा विधि', to: '/hi/vrat/navratri/' }, { label: 'नवरात्रि 2027 (English)', to: '/festivals/2027/navratri/' }],
    faq: [{ q: 'नवरात्रि में माँ दुर्गा के कौन से नौ रूप पूजे जाते हैं?', a: 'शैलपुत्री, ब्रह्मचारिणी, चंद्रघंटा, कूष्मांडा, स्कंदमाता, कात्यायनी, कालरात्रि, महागौरी और सिद्धिदात्री — हर दिन एक रूप।' }],
  },
  'raksha-bandhan': {
    what: ['रक्षाबंधन श्रावण पूर्णिमा को भाई-बहन के स्नेह का पर्व है। बहन भाई की कलाई पर राखी बाँधती है और उसकी कुशलता की प्रार्थना करती है; भाई रक्षा का वचन और उपहार देता है।', 'परंपरा में भद्रा (पूर्णिमा का पहला आधा भाग) में राखी नहीं बाँधी जाती, इसलिए समय का ध्यान रखा जाता है।'],
    observed: ['राखी, रोली, अक्षत, दीया और मिठाई की थाली सजाई जाती है।', 'बहन तिलक लगाकर राखी बाँधती है, आरती करती है और मिठाई खिलाती है।', 'भाई उपहार देता है और साथ निभाने का वचन देता है।', 'आजकल चचेरे भाई-बहन, मित्र और बहनें भी एक-दूसरे को राखी बाँधते हैं।'],
    regional: ['महाराष्ट्र तट: नारली पूर्णिमा (समुद्र को नारियल अर्पण), उसी पूर्णिमा पर', 'दक्षिण भारत: इसी पूर्णिमा के आसपास अवनी अवित्तम (उपाकर्म, जनेऊ बदलना)', 'पश्चिम बंगाल और ओडिशा: झूलन पूर्णिमा'],
    related: [{ label: 'रक्षाबंधन 2027 (English)', to: '/festivals/2027/raksha-bandhan/' }, { label: 'जन्माष्टमी 2027', to: '/hi/festivals/2027/janmashtami/' }],
    faq: [{ q: 'भद्रा में राखी क्यों नहीं बाँधी जाती?', a: 'भद्रा (विष्टि करण) को परंपरा में शुभ कार्यों के लिए उपयुक्त नहीं माना जाता। ऊपर दिया गया राखी का समय भद्रा समाप्त होने के बाद से पूर्णिमा रहने तक का है।' }],
  },
  'karwa-chauth': {
    what: ['करवा चौथ विवाहित महिलाओं — और अब कई दंपतियों — का व्रत है, जो जीवनसाथी की कुशलता और लंबी आयु के लिए कार्तिक कृष्ण चतुर्थी (उत्तर भारतीय पंचांग) को रखा जाता है। यह पंजाब, हरियाणा, राजस्थान, उत्तर प्रदेश और दिल्ली में व्यापक रूप से मनाया जाता है।', 'व्रत सूर्योदय से पहले से चंद्रोदय तक चलता है; चाँद देखकर अर्घ्य देने के बाद व्रत खोला जाता है।'],
    observed: ['सरगी — सूर्योदय से पहले का भोजन, अक्सर सास की ओर से।', 'दिन भर का व्रत, परंपरा से बिना अन्न-जल।', 'शाम को करवे (मिट्टी के पात्र) के साथ पूजा और करवा चौथ कथा।', 'चंद्रोदय पर छलनी से चाँद देखना, अर्घ्य देना और व्रत खोलना।'],
    regional: ['पंजाब, हरियाणा, राजस्थान, उत्तर प्रदेश, दिल्ली: करवा चौथ', 'आंध्र प्रदेश: अट्ला तद्दी इससे मिलता-जुलता महिलाओं का व्रत है'],
    related: [{ label: 'करवा चौथ व्रत कथा और पूजा विधि', to: '/hi/vrat/karwa-chauth/' }, { label: 'करवा चौथ 2027 (English)', to: '/festivals/2027/karwa-chauth/' }],
    faq: [{ q: 'हर शहर में चंद्रोदय का समय अलग क्यों होता है?', a: 'चंद्रोदय आपके स्थान पर निर्भर करता है। ऊपर दिया समय नई दिल्ली का है; दूसरे शहरों में चाँद कुछ मिनट से आधे घंटे से भी ज़्यादा पहले या बाद में निकल सकता है।' }],
  },
  'janmashtami': {
    what: ['कृष्ण जन्माष्टमी भगवान श्रीकृष्ण के जन्म का उत्सव है। मान्यता है कि उनका जन्म भाद्रपद कृष्ण अष्टमी (उत्तर भारतीय पंचांग) की आधी रात को हुआ था, इसलिए मुख्य पूजा निशीथ काल (मध्यरात्रि) में होती है।', 'भक्त दिन भर व्रत रखते हैं, बाल कृष्ण के लिए झूला सजाते हैं और मध्यरात्रि की पूजा के बाद व्रत खोलते हैं; मथुरा और वृंदावन के उत्सव सबसे प्रसिद्ध हैं।'],
    observed: ['सुबह से मध्यरात्रि की पूजा तक (या अगली सुबह तक) व्रत।', 'आधी रात को पंचामृत से बाल कृष्ण का अभिषेक और झूला झुलाना।', 'भजन-कीर्तन और कृष्ण की बाल लीलाओं की झाँकियाँ।', 'महाराष्ट्र में अगले दिन दही हांडी / गोपालकाला।'],
    regional: ['महाराष्ट्र: गोकुलाष्टमी और दही हांडी', 'केरल: अष्टमी रोहिणी', 'दक्षिण भारत: श्रीकृष्ण जयंती'],
    related: [{ label: 'जन्माष्टमी व्रत कथा और पूजा विधि', to: '/hi/vrat/janmashtami/' }, { label: 'जन्माष्टमी 2027 (English)', to: '/festivals/2027/janmashtami/' }],
    faq: [{ q: 'कभी-कभी जन्माष्टमी की दो तारीख़ें क्यों होती हैं?', a: 'स्मार्त पंचांग (जैसा यहाँ है) और वैष्णव / इस्कॉन पंचांग अष्टमी और रोहिणी नक्षत्र के अलग नियम मानते हैं, इसलिए उनमें एक दिन का अंतर हो सकता है।' }],
  },
  'mahashivratri': {
    what: ['महाशिवरात्रि — "शिव की महान रात्रि" — उत्तर भारतीय पंचांग में फाल्गुन कृष्ण चतुर्दशी (अमांत पंचांग में माघ) को मनाई जाती है। शिव भक्तों के लिए यह वर्ष की सबसे महत्वपूर्ण रातों में से एक है।', 'भक्त व्रत रखते हैं, रात भर जागरण करते हैं और रात के चारों प्रहरों में शिवलिंग की पूजा करते हैं; सबसे महत्वपूर्ण पूजा निशीथ काल (मध्यरात्रि) में होती है।'],
    observed: ['सुबह से अगले दिन तक व्रत — निर्जल या फल-दूध के साथ।', 'जल, दूध, दही, शहद और घी से शिवलिंग का अभिषेक, बेलपत्र अर्पण।', '"ॐ नमः शिवाय" का जाप और भजन के साथ रात्रि जागरण।', 'रात के चारों प्रहर में पूजा, मुख्य पूजा निशीथ काल में।'],
    regional: ['कश्मीर: हेरथ (कश्मीरी पंडितों की शिवरात्रि)', 'पूरे भारत में: महाशिवरात्रि, शिवरात्रि'],
    related: [{ label: 'महाशिवरात्रि व्रत कथा और पूजा विधि', to: '/hi/vrat/mahashivratri/' }, { label: 'महाशिवरात्रि 2027 (English)', to: '/festivals/2027/mahashivratri/' }],
    faq: [{ q: 'शिवरात्रि और महाशिवरात्रि में क्या अंतर है?', a: 'हर कृष्ण चतुर्दशी को मासिक शिवरात्रि होती है। फाल्गुन (पूर्णिमांत) की शिवरात्रि महाशिवरात्रि कहलाती है — वर्ष की सबसे महत्वपूर्ण।' }],
  },
  'makar-sankranti': {
    what: ['मकर संक्रांति सूर्य के मकर राशि (निरयन) में प्रवेश का पर्व है। अधिकतर हिंदू त्योहारों के विपरीत यह चंद्रमा नहीं, सूर्य के अनुसार होता है, इसलिए लगभग हर साल 14 या 15 जनवरी को पड़ता है। इसे उत्तरायण की शुरुआत और रबी की फ़सल से जोड़ा जाता है।', 'पूरे भारत में अलग-अलग नामों से पवित्र स्नान, दान, तिल-गुड़ की मिठाइयों और पश्चिम भारत में पतंगबाज़ी के साथ यह पर्व मनाया जाता है।'],
    observed: ['पुण्य काल में सूर्योदय पर स्नान — संभव हो तो गंगा जैसी नदी में।', 'दान: तिल, गुड़, चावल, कंबल और भोजन ज़रूरतमंदों को।', 'तिल-गुड़ की मिठाइयाँ; महाराष्ट्र में "तिळगुळ घ्या, गोड गोड बोला" कहकर तिल-गुड़ बाँटा जाता है।', 'गुजरात में उत्तरायण पर पतंगबाज़ी।', 'उत्तर प्रदेश और बिहार में खिचड़ी बनाना और दान करना।'],
    regional: ['तमिलनाडु: पोंगल', 'गुजरात: उत्तरायण', 'असम: माघ बिहू (भोगाली बिहू)', 'पंजाब: माघी', 'पश्चिम बंगाल: पौष संक्रांति', 'उत्तर प्रदेश और बिहार: खिचड़ी'],
    related: [{ label: 'मकर संक्रांति 2027 (English)', to: '/festivals/2027/makar-sankranti/' }, { label: 'लोहड़ी 2027', to: '/festivals/2027/lohri/' }],
    faq: [{ q: 'मकर संक्रांति की तारीख़ कभी-कभी एक दिन आगे क्यों हो जाती है?', a: 'पर्व सूर्य के मकर राशि में प्रवेश के सटीक क्षण के अनुसार होता है। यदि वह क्षण सूर्यास्त के बाद हो तो पर्व और पुण्य काल अगले दिन होते हैं — 2027 की स्थिति ऊपर गणना किए गए क्षण से देखें।' }],
  },
  'dhanteras': {
    what: ['धनतेरस कार्तिक कृष्ण त्रयोदशी (उत्तर भारतीय पंचांग) को दिवाली के पाँच दिनों की शुरुआत करता है। यह देवताओं के वैद्य और आयुर्वेद के देवता भगवान धन्वंतरि तथा माँ लक्ष्मी का दिन है; भारत में धनतेरस को राष्ट्रीय आयुर्वेद दिवस भी मनाया जाता है।', 'सोना, चाँदी या नए बर्तन ख़रीदना लोकप्रिय परंपरा है, और शाम को लक्ष्मी-कुबेर की पूजा होती है।'],
    observed: ['घर की सफ़ाई और सजावट; दीये जलाना।', 'प्रदोष काल में लक्ष्मी-कुबेर पूजा।', 'यम दीपम — शाम को दक्षिण दिशा की ओर एक दीया।', 'धातु के बर्तन या आभूषण ख़रीदना — परंपरा है, अनिवार्य नहीं।'],
    regional: ['इसे धनत्रयोदशी और धन्वंतरि जयंती भी कहते हैं'],
    related: [{ label: 'दिवाली 2027', to: '/hi/festivals/2027/diwali/' }, { label: 'धनतेरस 2027 (English)', to: '/festivals/2027/dhanteras/' }],
    faq: [{ q: 'क्या धनतेरस दिवाली से दो दिन पहले होता है?', a: 'आम तौर पर हाँ — त्रयोदशी, फिर चतुर्दशी (नरक चतुर्दशी / छोटी दिवाली), फिर अमावस्या (दिवाली)। 2027 में धनतेरस {d:dhanteras} और दिवाली {d:diwali} को है।' }],
  },
  'chhath-puja': {
    what: ['छठ पूजा सूर्य देव और छठी मैया को समर्पित चार दिन का पर्व है, जो मुख्य रूप से बिहार, झारखंड, पूर्वी उत्तर प्रदेश और नेपाल के मधेश क्षेत्र में — और जहाँ भी इन क्षेत्रों के लोग रहते हैं — मनाया जाता है।', 'इसका मूल कार्तिक शुक्ल षष्ठी को डूबते सूर्य को और अगली सुबह उगते सूर्य को नदी या तालाब में खड़े होकर अर्घ्य देना है।'],
    observed: ['पहला दिन, नहाय-खाय: पवित्र स्नान और सात्विक भोजन।', 'दूसरा दिन, खरना: दिन भर व्रत, शाम को खीर-रोटी से पारण; फिर निर्जल व्रत शुरू।', 'तीसरा दिन, संध्या अर्घ्य: नदी या तालाब के घाट पर डूबते सूर्य को अर्घ्य।', 'चौथा दिन, उषा अर्घ्य: उगते सूर्य को अर्घ्य, फिर व्रत का पारण; ठेकुआ पारंपरिक प्रसाद है।'],
    regional: ['बिहार, झारखंड, पूर्वी उत्तर प्रदेश, नेपाल: छठ, छठी, सूर्य षष्ठी', 'चैत्र में एक छोटा छठ — चैती छठ — भी मनाया जाता है'],
    related: [{ label: 'छठ पूजा 2027 (English)', to: '/festivals/2027/chhath-puja/' }, { label: 'दिवाली 2027', to: '/hi/festivals/2027/diwali/' }],
    faq: [{ q: 'क्या छठ का व्रत निर्जल होता है?', a: 'परंपरा से हाँ — खरना के बाद व्रती सुबह के अर्घ्य तक निर्जल व्रत रखते हैं। किसी स्वास्थ्य समस्या में डॉक्टर की सलाह से व्रत में बदलाव करें।' }],
  },
};
