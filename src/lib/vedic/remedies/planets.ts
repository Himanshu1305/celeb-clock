/**
 * Per-planet remedy building blocks (Navagraha). Dosha entries in catalog.ts are
 * composed from these, so a mantra or daan item is written once and reused.
 */
import type { Daan, L10n, Mantra, PlanetName, Practice, Puja } from './types';
import { SRC } from './sources';

export interface PlanetBase {
  planet: PlanetName;
  name: L10n;
  beej: Mantra;
  stotra: Mantra;
  fasting: Practice;
  lifestyle: Practice[];
  seva: Practice[];
  daan: Daan;
  puja: Puja[];
  temples: string[];
  gem: { en: string; hi: string };
}

const MALA: L10n = { en: '108 times (one mala) a day; the traditional full japa is {N}', hi: 'प्रतिदिन 108 बार (एक माला); पारंपरिक पूर्ण जप संख्या {N}' };
const count = (n: string): L10n => ({ en: MALA.en.replace('{N}', n), hi: MALA.hi.replace('{N}', n) });
const ONCE_DAILY: L10n = { en: 'Once or three times a day — 11 or 108 recitations on the planet’s weekday are also common', hi: 'दिन में एक या तीन बार — ग्रह के वार पर 11 या 108 बार पाठ भी प्रचलित है' };

const FAST_NOTE_EN = ' A light fast (one simple meal, or fruit and milk) is the usual form. Fasting is optional — skip it if you are pregnant, unwell, elderly or on medication; the mantra and seva work just as well on their own.';
const FAST_NOTE_HI = ' सामान्य रूप हल्का व्रत है (एक सादा भोजन, या फल और दूध)। व्रत वैकल्पिक है — गर्भावस्था, बीमारी, बुढ़ापे या दवा चलने पर इसे न करें; मंत्र और सेवा अपने आप में पर्याप्त हैं।';
const fast = (en: string, hi: string, source: string = SRC.vara): Practice => ({ text: { en: en + FAST_NOTE_EN, hi: hi + FAST_NOTE_HI }, source });

export const PLANET_BASE: Record<PlanetName, PlanetBase> = {
  Sun: {
    planet: 'Sun',
    name: { en: 'Surya (Sun)', hi: 'सूर्य' },
    beej: { name: { en: 'Surya beej mantra', hi: 'सूर्य बीज मंत्र' }, devanagari: 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', transliteration: 'Om Hraam Hreem Hraum Sah Suryaya Namah', count: count('7,000'), when: { en: 'Sunday mornings, facing east, after bathing', hi: 'रविवार सुबह, स्नान के बाद पूर्व की ओर मुख करके' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Surya verse', hi: 'नवग्रह स्तोत्र — सूर्य श्लोक' }, devanagari: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्। तमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥', transliteration: 'Japakusuma sankasham kashyapeyam mahadyutim, tamorim sarva papaghnam pranatosmi divakaram', count: ONCE_DAILY, when: { en: 'At sunrise', hi: 'सूर्योदय के समय' }, source: SRC.navagrahaStotra },
    fasting: fast('Sunday (Ravivar) vrat.', 'रविवार व्रत।'),
    lifestyle: [
      { text: { en: 'Offer water (arghya) to the rising Sun from a copper vessel — a two-minute morning habit.', hi: 'तांबे के लोटे से उगते सूर्य को जल (अर्घ्य) दें — सुबह की दो मिनट की आदत।' }, source: SRC.devata },
      { text: { en: 'Respect and look after your father and elders; keep your word at work.', hi: 'पिता और बड़ों का सम्मान और सेवा करें; काम में अपनी बात के पक्के रहें।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Help an elderly person or a father figure in a practical way.', hi: 'किसी बुज़ुर्ग या पिता-तुल्य व्यक्ति की व्यावहारिक मदद करें।' }, source: SRC.sense }],
    daan: { what: { en: 'Wheat, jaggery (gur), red or saffron cloth, copper', hi: 'गेहूँ, गुड़, लाल या केसरिया वस्त्र, तांबा' }, toWhom: { en: 'A temple, a priest or someone in need', hi: 'मंदिर, पुरोहित या किसी ज़रूरतमंद को' }, day: { en: 'Sunday, in the morning', hi: 'रविवार, सुबह' }, source: SRC.daan },
    puja: [
      { name: { en: 'Surya puja with arghya', hi: 'अर्घ्य सहित सूर्य पूजा' }, when: { en: 'Any Sunday, at sunrise', hi: 'किसी भी रविवार, सूर्योदय पर' }, where: 'home', note: { en: 'Simple to do yourself; no priest needed.', hi: 'आप स्वयं कर सकते हैं; पुरोहित की आवश्यकता नहीं।' }, source: SRC.devata },
      { name: { en: 'Surya graha shanti (japa and havan)', hi: 'सूर्य ग्रह शांति (जप और हवन)' }, when: { en: 'A Sunday chosen with a priest (often in Surya hora)', hi: 'पुरोहित द्वारा चुना गया रविवार (प्रायः सूर्य होरा में)' }, where: 'priest', note: { en: 'Optional; done by a priest at home or at a temple.', hi: 'वैकल्पिक; पुरोहित घर पर या मंदिर में करते हैं।' }, source: SRC.grahaShanti },
    ],
    temples: ['suryanarKovil'],
    gem: { en: 'Ruby (Manik)', hi: 'माणिक्य (माणिक)' },
  },
  Moon: {
    planet: 'Moon',
    name: { en: 'Chandra (Moon)', hi: 'चंद्र' },
    beej: { name: { en: 'Chandra beej mantra', hi: 'चंद्र बीज मंत्र' }, devanagari: 'ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः', transliteration: 'Om Shraam Shreem Shraum Sah Chandramase Namah', count: count('11,000'), when: { en: 'Monday evenings', hi: 'सोमवार शाम' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Chandra verse', hi: 'नवग्रह स्तोत्र — चंद्र श्लोक' }, devanagari: 'दधिशंखतुषाराभं क्षीरोदार्णवसंभवम्। नमामि शशिनं सोमं शंभोर्मुकुटभूषणम्॥', transliteration: 'Dadhi shankha tusharabham kshirodarnava sambhavam, namami shashinam somam shambhor mukuta bhushanam', count: ONCE_DAILY, when: { en: 'Monday, or any evening', hi: 'सोमवार या किसी भी शाम' }, source: SRC.navagrahaStotra },
    fasting: fast('Monday (Somvar) vrat, often with a visit to a Shiva temple.', 'सोमवार व्रत, प्रायः शिव मंदिर दर्शन के साथ।'),
    lifestyle: [
      { text: { en: 'Spend unhurried time with your mother or a mother figure, and keep in touch regularly.', hi: 'माँ या माँ-समान व्यक्ति के साथ समय बिताएँ और नियमित संपर्क रखें।' }, source: SRC.lalKitab },
      { text: { en: 'Keep a calm evening routine — a few quiet minutes of prayer or reflection before sleep.', hi: 'शाम की दिनचर्या शांत रखें — सोने से पहले कुछ मिनट प्रार्थना या चिंतन।' }, source: SRC.sense },
    ],
    seva: [{ text: { en: 'Offer drinking water to passers-by (a pyau) or help an older woman in your neighbourhood.', hi: 'राहगीरों को पीने का पानी (प्याऊ) दें या पड़ोस की किसी बुज़ुर्ग महिला की मदद करें।' }, source: SRC.sense }],
    daan: { what: { en: 'Rice, milk, white cloth, sugar, silver', hi: 'चावल, दूध, सफ़ेद वस्त्र, चीनी, चाँदी' }, toWhom: { en: 'A temple, a mother figure, or someone in need', hi: 'मंदिर, माँ-समान व्यक्ति या किसी ज़रूरतमंद को' }, day: { en: 'Monday, in the evening', hi: 'सोमवार, शाम' }, source: SRC.daan },
    puja: [
      { name: { en: 'Shiva abhishek with water or milk', hi: 'जल या दूध से शिव अभिषेक' }, when: { en: 'Mondays (Shravan Mondays especially)', hi: 'सोमवार (विशेषकर श्रावण सोमवार)' }, where: 'home-or-priest', note: { en: 'Can be done at home or at any Shiva temple.', hi: 'घर पर या किसी भी शिव मंदिर में कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Chandra graha shanti (japa and havan)', hi: 'चंद्र ग्रह शांति (जप और हवन)' }, when: { en: 'A Monday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया सोमवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['thingalur', 'somnath'],
    gem: { en: 'Pearl (Moti)', hi: 'मोती' },
  },
  Mars: {
    planet: 'Mars',
    name: { en: 'Mangal (Mars)', hi: 'मंगल' },
    beej: { name: { en: 'Mangal beej mantra', hi: 'मंगल बीज मंत्र' }, devanagari: 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः', transliteration: 'Om Kraam Kreem Kraum Sah Bhaumaya Namah', count: count('10,000'), when: { en: 'Tuesday mornings', hi: 'मंगलवार सुबह' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Mangal verse', hi: 'नवग्रह स्तोत्र — मंगल श्लोक' }, devanagari: 'धरणीगर्भसंभूतं विद्युत्कान्तिसमप्रभम्। कुमारं शक्तिहस्तं तं मंगलं प्रणमाम्यहम्॥', transliteration: 'Dharani garbha sambhutam vidyut kanti samaprabham, kumaram shakti hastam tam mangalam pranamamyaham', count: ONCE_DAILY, when: { en: 'Tuesday', hi: 'मंगलवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Tuesday (Mangalvar) vrat, often with Hanuman puja.', 'मंगलवार व्रत, प्रायः हनुमान पूजा के साथ।'),
    lifestyle: [
      { text: { en: 'Give Mars a healthy outlet — regular exercise, sport or physically demanding work.', hi: 'मंगल की ऊर्जा को सही दिशा दें — नियमित व्यायाम, खेल या मेहनत का काम।' }, source: SRC.sense },
      { text: { en: 'Pause before reacting in anger; keep good terms with brothers and colleagues.', hi: 'गुस्से में प्रतिक्रिया से पहले रुकें; भाइयों और सहकर्मियों से अच्छे संबंध रखें।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Volunteer time where physical help is needed — a temple, a shelter, a local clean-up.', hi: 'जहाँ शारीरिक मदद चाहिए वहाँ समय दें — मंदिर, आश्रय, या मोहल्ले की सफ़ाई।' }, source: SRC.sense }],
    daan: { what: { en: 'Red lentils (masoor dal), jaggery, red cloth, copper', hi: 'मसूर दाल, गुड़, लाल वस्त्र, तांबा' }, toWhom: { en: 'A Hanuman temple or someone in need', hi: 'हनुमान मंदिर या किसी ज़रूरतमंद को' }, day: { en: 'Tuesday', hi: 'मंगलवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Hanuman puja with Hanuman Chalisa', hi: 'हनुमान चालीसा सहित हनुमान पूजा' }, when: { en: 'Tuesdays (and Saturdays)', hi: 'मंगलवार (और शनिवार)' }, where: 'home', note: { en: 'Simple to do at home; visiting a Hanuman temple is also common.', hi: 'घर पर आसानी से कर सकते हैं; हनुमान मंदिर जाना भी प्रचलित है।' }, source: SRC.devata },
      { name: { en: 'Mangal graha shanti (japa and havan)', hi: 'मंगल ग्रह शांति (जप और हवन)' }, when: { en: 'A Tuesday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया मंगलवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['mangalnath', 'vaitheeswaran'],
    gem: { en: 'Red Coral (Moonga)', hi: 'मूंगा' },
  },
  Mercury: {
    planet: 'Mercury',
    name: { en: 'Budh (Mercury)', hi: 'बुध' },
    beej: { name: { en: 'Budh beej mantra', hi: 'बुध बीज मंत्र' }, devanagari: 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', transliteration: 'Om Braam Breem Braum Sah Budhaya Namah', count: count('9,000'), when: { en: 'Wednesday mornings', hi: 'बुधवार सुबह' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Budh verse', hi: 'नवग्रह स्तोत्र — बुध श्लोक' }, devanagari: 'प्रियंगुकलिकाश्यामं रूपेणाप्रतिमं बुधम्। सौम्यं सौम्यगुणोपेतं तं बुधं प्रणमाम्यहम्॥', transliteration: 'Priyangu kalika shyamam rupena apratimam budham, saumyam saumya gunopetam tam budham pranamamyaham', count: ONCE_DAILY, when: { en: 'Wednesday', hi: 'बुधवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Wednesday (Budhvar) vrat, often with Ganesha puja.', 'बुधवार व्रत, प्रायः गणेश पूजा के साथ।'),
    lifestyle: [
      { text: { en: 'Keep your words and accounts clean — honest communication is Mercury’s own remedy.', hi: 'बोली और हिसाब साफ़ रखें — सच्चा संवाद ही बुध का अपना उपाय है।' }, source: SRC.sense },
      { text: { en: 'Respect and support sisters, daughters and aunts.', hi: 'बहनों, बेटियों और बुआ/मौसी का सम्मान और सहयोग करें।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Teach or tutor a child, or give books and stationery to students.', hi: 'किसी बच्चे को पढ़ाएँ, या विद्यार्थियों को किताबें और स्टेशनरी दें।' }, source: SRC.sense }],
    daan: { what: { en: 'Green moong dal, green cloth, green vegetables, books', hi: 'हरी मूंग दाल, हरा वस्त्र, हरी सब्ज़ियाँ, पुस्तकें' }, toWhom: { en: 'Students, a temple or someone in need; green fodder to cows', hi: 'विद्यार्थियों, मंदिर या ज़रूरतमंद को; गायों को हरा चारा' }, day: { en: 'Wednesday', hi: 'बुधवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Ganesha puja', hi: 'गणेश पूजा' }, when: { en: 'Wednesdays', hi: 'बुधवार' }, where: 'home', note: { en: 'Simple to do at home.', hi: 'घर पर आसानी से कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Budh graha shanti (japa and havan)', hi: 'बुध ग्रह शांति (जप और हवन)' }, when: { en: 'A Wednesday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया बुधवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['thiruvenkadu'],
    gem: { en: 'Emerald (Panna)', hi: 'पन्ना' },
  },
  Jupiter: {
    planet: 'Jupiter',
    name: { en: 'Guru (Jupiter)', hi: 'गुरु (बृहस्पति)' },
    beej: { name: { en: 'Guru beej mantra', hi: 'गुरु बीज मंत्र' }, devanagari: 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', transliteration: 'Om Graam Greem Graum Sah Gurave Namah', count: count('19,000'), when: { en: 'Thursday mornings', hi: 'गुरुवार सुबह' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Guru verse', hi: 'नवग्रह स्तोत्र — गुरु श्लोक' }, devanagari: 'देवानां च ऋषीणां च गुरुं कांचनसन्निभम्। बुद्धिभूतं त्रिलोकेशं तं नमामि बृहस्पतिम्॥', transliteration: 'Devanam cha rishinam cha gurum kanchana sannibham, buddhibhutam trilokesham tam namami brihaspatim', count: ONCE_DAILY, when: { en: 'Thursday', hi: 'गुरुवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Thursday (Guruvar) vrat, often with Vishnu puja.', 'गुरुवार व्रत, प्रायः विष्णु पूजा के साथ।'),
    lifestyle: [
      { text: { en: 'Respect teachers, elders and mentors; keep promises.', hi: 'गुरुओं, बड़ों और मार्गदर्शकों का सम्मान करें; वचन निभाएँ।' }, source: SRC.lalKitab },
      { text: { en: 'A small saffron or turmeric tilak on Thursdays is a common custom.', hi: 'गुरुवार को केसर या हल्दी का छोटा तिलक लगाना प्रचलित प्रथा है।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Support education — fees, books or time for a student who needs it.', hi: 'शिक्षा में सहयोग करें — किसी ज़रूरतमंद विद्यार्थी की फ़ीस, किताबें या समय।' }, source: SRC.sense }],
    daan: { what: { en: 'Chana dal, turmeric, yellow cloth, bananas, books', hi: 'चना दाल, हल्दी, पीला वस्त्र, केले, पुस्तकें' }, toWhom: { en: 'A temple, a teacher or priest, or students', hi: 'मंदिर, गुरु या पुरोहित, या विद्यार्थियों को' }, day: { en: 'Thursday', hi: 'गुरुवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Vishnu / Brihaspati puja', hi: 'विष्णु / बृहस्पति पूजा' }, when: { en: 'Thursdays', hi: 'गुरुवार' }, where: 'home', note: { en: 'Simple to do at home.', hi: 'घर पर आसानी से कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Guru graha shanti (japa and havan)', hi: 'गुरु ग्रह शांति (जप और हवन)' }, when: { en: 'A Thursday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया गुरुवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['alangudi'],
    gem: { en: 'Yellow Sapphire (Pukhraj)', hi: 'पुखराज' },
  },
  Venus: {
    planet: 'Venus',
    name: { en: 'Shukra (Venus)', hi: 'शुक्र' },
    beej: { name: { en: 'Shukra beej mantra', hi: 'शुक्र बीज मंत्र' }, devanagari: 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', transliteration: 'Om Draam Dreem Draum Sah Shukraya Namah', count: count('16,000'), when: { en: 'Friday mornings', hi: 'शुक्रवार सुबह' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Shukra verse', hi: 'नवग्रह स्तोत्र — शुक्र श्लोक' }, devanagari: 'हिमकुंदमृणालाभं दैत्यानां परमं गुरुम्। सर्वशास्त्रप्रवक्तारं भार्गवं प्रणमाम्यहम्॥', transliteration: 'Hima kunda mrinalabham daityanam paramam gurum, sarva shastra pravaktaram bhargavam pranamamyaham', count: ONCE_DAILY, when: { en: 'Friday', hi: 'शुक्रवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Friday (Shukravar) vrat, often with Lakshmi puja.', 'शुक्रवार व्रत, प्रायः लक्ष्मी पूजा के साथ।'),
    lifestyle: [
      { text: { en: 'Treat your spouse and the women in your life with respect and warmth.', hi: 'जीवनसाथी और जीवन की महिलाओं के साथ सम्मान और स्नेह से पेश आएँ।' }, source: SRC.lalKitab },
      { text: { en: 'Keep yourself and your home clean and pleasant; make time for music or art.', hi: 'स्वयं और घर को साफ़-सुथरा और सुखद रखें; संगीत या कला के लिए समय निकालें।' }, source: SRC.sense },
    ],
    seva: [{ text: { en: 'Support a girl’s education or a women’s self-help group; feed a cow.', hi: 'किसी बालिका की शिक्षा या महिला स्वयं-सहायता समूह का सहयोग करें; गाय को भोजन दें।' }, source: SRC.lalKitab }],
    daan: { what: { en: 'Rice, white sweets, curd, white cloth, ghee', hi: 'चावल, सफ़ेद मिठाई, दही, सफ़ेद वस्त्र, घी' }, toWhom: { en: 'A temple, a woman in need, or a young girl', hi: 'मंदिर, किसी ज़रूरतमंद महिला या कन्या को' }, day: { en: 'Friday', hi: 'शुक्रवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Lakshmi puja', hi: 'लक्ष्मी पूजा' }, when: { en: 'Fridays', hi: 'शुक्रवार' }, where: 'home', note: { en: 'Simple to do at home.', hi: 'घर पर आसानी से कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Shukra graha shanti (japa and havan)', hi: 'शुक्र ग्रह शांति (जप और हवन)' }, when: { en: 'A Friday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया शुक्रवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['kanjanur'],
    gem: { en: 'Diamond (Heera)', hi: 'हीरा' },
  },
  Saturn: {
    planet: 'Saturn',
    name: { en: 'Shani (Saturn)', hi: 'शनि' },
    beej: { name: { en: 'Shani beej mantra', hi: 'शनि बीज मंत्र' }, devanagari: 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', transliteration: 'Om Praam Preem Praum Sah Shanaishcharaya Namah', count: count('23,000'), when: { en: 'Saturday evenings', hi: 'शनिवार शाम' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Shani verse', hi: 'नवग्रह स्तोत्र — शनि श्लोक' }, devanagari: 'नीलांजनसमाभासं रविपुत्रं यमाग्रजम्। छायामार्तण्डसंभूतं तं नमामि शनैश्चरम्॥', transliteration: 'Nilanjana samabhasam raviputram yamagrajam, chhaya martanda sambhutam tam namami shanaishcharam', count: ONCE_DAILY, when: { en: 'Saturday', hi: 'शनिवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Saturday (Shanivar) vrat.', 'शनिवार व्रत।'),
    lifestyle: [
      { text: { en: 'Work steadily and honestly, be punctual and finish what you start — these are Saturn’s own themes.', hi: 'लगन और ईमानदारी से काम करें, समय के पाबंद रहें और जो शुरू करें उसे पूरा करें — यही शनि के अपने विषय हैं।' }, source: SRC.sense },
      { text: { en: 'Treat workers, staff and the elderly fairly and kindly. Lal Kitab also advises keeping away from alcohol.', hi: 'मज़दूरों, कर्मचारियों और बुज़ुर्गों के साथ न्याय और दया रखें। लाल किताब शराब से दूर रहने की सलाह भी देती है।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Serve labourers, the elderly, the disabled or the poor — a meal, blankets in winter, or your time — especially on Saturdays.', hi: 'मज़दूरों, बुज़ुर्गों, दिव्यांगों या गरीबों की सेवा करें — भोजन, सर्दी में कंबल, या अपना समय — विशेषकर शनिवार को।' }, source: SRC.lalKitab }],
    daan: { what: { en: 'Black sesame (til), mustard oil, black urad dal, black cloth or blankets, iron items', hi: 'काले तिल, सरसों का तेल, काली उड़द दाल, काला वस्त्र या कंबल, लोहे की वस्तुएँ' }, toWhom: { en: 'Labourers, the elderly or the poor, or a Shani temple', hi: 'मज़दूरों, बुज़ुर्गों या गरीबों को, या शनि मंदिर में' }, day: { en: 'Saturday, in the evening', hi: 'शनिवार, शाम' }, source: SRC.daan },
    puja: [
      { name: { en: 'Mustard-oil lamp under a peepal tree, with the Shani mantra', hi: 'शनि मंत्र के साथ पीपल के नीचे सरसों के तेल का दीपक' }, when: { en: 'Saturday evenings', hi: 'शनिवार शाम' }, where: 'home', note: { en: 'Done yourself; no priest needed.', hi: 'स्वयं करें; पुरोहित की आवश्यकता नहीं।' }, source: SRC.devata },
      { name: { en: 'Hanuman Chalisa / Hanuman puja', hi: 'हनुमान चालीसा / हनुमान पूजा' }, when: { en: 'Saturdays and Tuesdays', hi: 'शनिवार और मंगलवार' }, where: 'home', note: { en: 'Widely recited during Saturn periods.', hi: 'शनि काल में व्यापक रूप से पढ़ी जाती है।' }, source: SRC.hanumanChalisa },
      { name: { en: 'Shani graha shanti (japa and havan)', hi: 'शनि ग्रह शांति (जप और हवन)' }, when: { en: 'A Saturday, or Shani Jayanti (Jyeshtha Amavasya), chosen with a priest', hi: 'शनिवार या शनि जयंती (ज्येष्ठ अमावस्या), पुरोहित द्वारा चुना गया' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['thirunallar', 'shaniShingnapur'],
    gem: { en: 'Blue Sapphire (Neelam)', hi: 'नीलम' },
  },
  Rahu: {
    planet: 'Rahu',
    name: { en: 'Rahu', hi: 'राहु' },
    beej: { name: { en: 'Rahu beej mantra', hi: 'राहु बीज मंत्र' }, devanagari: 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः', transliteration: 'Om Bhraam Bhreem Bhraum Sah Rahave Namah', count: count('18,000'), when: { en: 'Saturday evenings', hi: 'शनिवार शाम' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Rahu verse', hi: 'नवग्रह स्तोत्र — राहु श्लोक' }, devanagari: 'अर्धकायं महावीर्यं चन्द्रादित्यविमर्दनम्। सिंहिकागर्भसंभूतं तं राहुं प्रणमाम्यहम्॥', transliteration: 'Ardhakayam mahaviryam chandraditya vimardanam, simhika garbha sambhutam tam rahum pranamamyaham', count: ONCE_DAILY, when: { en: 'Saturday', hi: 'शनिवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Saturday vrat is the common choice for Rahu (traditions vary).', 'राहु के लिए प्रायः शनिवार व्रत रखा जाता है (परंपराएँ अलग-अलग हैं)।'),
    lifestyle: [
      { text: { en: 'Avoid shortcuts, deception and intoxicants; keep your digital life and habits in check.', hi: 'शॉर्टकट, छल और नशे से बचें; अपनी डिजिटल आदतों पर नियंत्रण रखें।' }, source: SRC.sense },
      { text: { en: 'Keep cordial relations with in-laws.', hi: 'ससुराल पक्ष से मधुर संबंध रखें।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Help people on the margins — sanitation workers, the homeless, those society overlooks.', hi: 'हाशिये के लोगों की मदद करें — सफ़ाई कर्मचारी, बेघर, जिन्हें समाज अनदेखा करता है।' }, source: SRC.sense }],
    daan: { what: { en: 'Black sesame, mustard oil, blue or black cloth, blankets', hi: 'काले तिल, सरसों का तेल, नीला या काला वस्त्र, कंबल' }, toWhom: { en: 'The poor or sanitation workers, or a temple', hi: 'गरीबों या सफ़ाई कर्मचारियों को, या मंदिर में' }, day: { en: 'Saturday', hi: 'शनिवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Durga puja / Durga Saptashati reading', hi: 'दुर्गा पूजा / दुर्गा सप्तशती पाठ' }, when: { en: 'Saturdays, or during Navratri', hi: 'शनिवार, या नवरात्रि में' }, where: 'home-or-priest', note: { en: 'Short prayers at home; a full Saptashati path is often done with a priest.', hi: 'घर पर छोटी प्रार्थना; पूरा सप्तशती पाठ प्रायः पुरोहित के साथ।' }, source: SRC.devata },
      { name: { en: 'Rahu graha shanti (japa and havan)', hi: 'राहु ग्रह शांति (जप और हवन)' }, when: { en: 'A Saturday chosen with a priest', hi: 'पुरोहित द्वारा चुना गया शनिवार' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['thirunageswaram', 'srikalahasti'],
    gem: { en: 'Hessonite (Gomed)', hi: 'गोमेद' },
  },
  Ketu: {
    planet: 'Ketu',
    name: { en: 'Ketu', hi: 'केतु' },
    beej: { name: { en: 'Ketu beej mantra', hi: 'केतु बीज मंत्र' }, devanagari: 'ॐ स्रां स्रीं स्रौं सः केतवे नमः', transliteration: 'Om Sraam Sreem Sraum Sah Ketave Namah', count: count('17,000'), when: { en: 'Tuesday or Saturday', hi: 'मंगलवार या शनिवार' }, source: SRC.beej },
    stotra: { name: { en: 'Navagraha Stotra — Ketu verse', hi: 'नवग्रह स्तोत्र — केतु श्लोक' }, devanagari: 'पलाशपुष्पसंकाशं तारकाग्रहमस्तकम्। रौद्रं रौद्रात्मकं घोरं तं केतुं प्रणमाम्यहम्॥', transliteration: 'Palasha pushpa sankasham taraka graha mastakam, raudram raudratmakam ghoram tam ketum pranamamyaham', count: ONCE_DAILY, when: { en: 'Tuesday or Saturday', hi: 'मंगलवार या शनिवार' }, source: SRC.navagrahaStotra },
    fasting: fast('Tuesday or Saturday vrat (traditions vary for Ketu).', 'मंगलवार या शनिवार व्रत (केतु के लिए परंपराएँ अलग-अलग हैं)।'),
    lifestyle: [
      { text: { en: 'A regular quiet practice — meditation, japa or prayer — suits Ketu’s inward nature.', hi: 'नियमित शांत साधना — ध्यान, जप या प्रार्थना — केतु के अंतर्मुखी स्वभाव के अनुकूल है।' }, source: SRC.sense },
      { text: { en: 'Feed and care for street dogs.', hi: 'गली के कुत्तों को भोजन दें और उनकी देखभाल करें।' }, source: SRC.lalKitab },
    ],
    seva: [{ text: { en: 'Animal care and feeding, or helping at a temple or ashram.', hi: 'पशुओं की देखभाल और भोजन, या मंदिर/आश्रम में सेवा।' }, source: SRC.lalKitab }],
    daan: { what: { en: 'A multi-coloured or grey blanket, sesame, food for dogs', hi: 'रंग-बिरंगा या धूसर कंबल, तिल, कुत्तों के लिए भोजन' }, toWhom: { en: 'The poor, an ashram or temple; food to street dogs', hi: 'गरीबों, आश्रम या मंदिर को; गली के कुत्तों को भोजन' }, day: { en: 'Tuesday or Saturday', hi: 'मंगलवार या शनिवार' }, source: SRC.daan },
    puja: [
      { name: { en: 'Ganesha puja', hi: 'गणेश पूजा' }, when: { en: 'Tuesdays or Chaturthi', hi: 'मंगलवार या चतुर्थी' }, where: 'home', note: { en: 'Simple to do at home.', hi: 'घर पर आसानी से कर सकते हैं।' }, source: SRC.devata },
      { name: { en: 'Ketu graha shanti (japa and havan)', hi: 'केतु ग्रह शांति (जप और हवन)' }, when: { en: 'A day chosen with a priest', hi: 'पुरोहित द्वारा चुना गया दिन' }, where: 'priest', note: { en: 'Optional.', hi: 'वैकल्पिक।' }, source: SRC.grahaShanti },
    ],
    temples: ['keezhaperumpallam', 'srikalahasti'],
    gem: { en: "Cat's Eye (Lehsunia)", hi: 'लहसुनिया' },
  },
};

export const PLANET_ORDER: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
