import React from 'react';
import { SEO } from '@/components/SEO';
import { WESTERN_ZODIAC_PROFILES } from '@/data/astrologicalData';

function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

// Mirrors the base slug logic of generateCelebritySlug in src/utils/celebrityUtils.ts.
function celebritySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''`’‘]/g, '')
    .replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Celeb { name: string; dob: string; }

// Real celebrity names + DOBs extracted from src/data/indianCelebrities.ts.
// NEVER fabricate — these are verified DB entries (Jan-1 placeholders excluded).
const CELEBS_BY_MONTH: Record<number, Celeb[]> = {
  1: [
    { name: 'Subhas Chandra Bose', dob: '1897-01-23' },
    { name: 'Swami Vivekananda', dob: '1863-01-12' },
    { name: 'Lala Lajpat Rai', dob: '1865-01-28' },
    { name: 'Paramahansa Yogananda', dob: '1893-01-05' },
    { name: 'Maharishi Mahesh Yogi', dob: '1917-01-12' },
    { name: 'Mamata Banerjee', dob: '1955-01-05' },
    { name: 'Mayawati', dob: '1956-01-15' },
    { name: 'Hrithik Roshan', dob: '1974-01-10' },
    { name: 'Irrfan Khan', dob: '1967-01-07' },
    { name: 'Deepika Padukone', dob: '1986-01-05' },
    { name: 'Kapil Dev', dob: '1959-01-06' },
    { name: 'Rahul Dravid', dob: '1973-01-11' },
  ],
  2: [
    { name: 'Sarojini Naidu', dob: '1879-02-13' },
    { name: 'Dayananda Saraswati', dob: '1824-02-12' },
    { name: 'Ramakrishna Paramahamsa', dob: '1836-02-18' },
    { name: 'Shahid Kapoor', dob: '1981-02-25' },
    { name: 'Sanjay Leela Bhansali', dob: '1963-02-24' },
    { name: 'Jackie Shroff', dob: '1957-02-01' },
    { name: 'Abhishek Bachchan', dob: '1976-02-05' },
    { name: 'Bhuvneshwar Kumar', dob: '1990-02-05' },
    { name: 'Amrita Singh', dob: '1958-02-09' },
    { name: 'Pran', dob: '1920-02-12' },
    { name: 'Sushma Swaraj', dob: '1952-02-14' },
  ],
  3: [
    { name: 'Aamir Khan', dob: '1965-03-14' },
    { name: 'Alia Bhatt', dob: '1993-03-15' },
    { name: 'Kangana Ranaut', dob: '1987-03-23' },
    { name: 'Ram Charan', dob: '1985-03-27' },
    { name: 'Zakir Hussain', dob: '1951-03-09' },
    { name: 'Saina Nehwal', dob: '1990-03-17' },
    { name: 'Tiger Shroff', dob: '1990-03-02' },
    { name: 'Shraddha Kapoor', dob: '1989-03-03' },
    { name: 'Divya Khosla Kumar', dob: '1983-03-07' },
    { name: 'Anupam Kher', dob: '1955-03-07' },
    { name: 'Gangubai Hangal', dob: '1913-03-05' },
    { name: 'Nitish Kumar', dob: '1951-03-08' },
  ],
  4: [
    { name: 'Bhimrao Ambedkar', dob: '1891-04-14' },
    { name: 'Aryabhata', dob: '0476-04-13' },
    { name: 'Guru Nanak Dev', dob: '1469-04-15' },
    { name: 'Venkatraman Ramakrishnan', dob: '1952-04-01' },
    { name: 'Ajay Devgn', dob: '1969-04-02' },
    { name: 'Allu Arjun', dob: '1983-04-08' },
    { name: 'Sachin Tendulkar', dob: '1973-04-24' },
    { name: 'Rohit Sharma', dob: '1987-04-30' },
    { name: 'Ravi Shankar', dob: '1920-04-07' },
    { name: 'Arijit Singh', dob: '1987-04-25' },
    { name: 'Mukesh Ambani', dob: '1957-04-19' },
    { name: 'Chetan Bhagat', dob: '1974-04-22' },
  ],
  5: [
    { name: 'Rabindranath Tagore', dob: '1861-05-07' },
    { name: 'Gopal Krishna Gokhale', dob: '1866-05-09' },
    { name: 'Ram Mohan Roy', dob: '1772-05-22' },
    { name: 'J. Krishnamurti', dob: '1895-05-12' },
    { name: 'Sri Sri Ravi Shankar', dob: '1956-05-13' },
    { name: 'Nawazuddin Siddiqui', dob: '1974-05-19' },
    { name: 'Madhuri Dixit', dob: '1967-05-15' },
    { name: 'Ajith Kumar', dob: '1971-05-01' },
    { name: 'Jr NTR', dob: '1983-05-20' },
    { name: 'Mohanlal', dob: '1960-05-21' },
    { name: 'Trisha Krishnan', dob: '1983-05-04' },
    { name: 'Ruskin Bond', dob: '1934-05-19' },
  ],
  6: [
    { name: 'Ram Prasad Bismil', dob: '1897-06-11' },
    { name: 'Bankim Chandra Chattopadhyay', dob: '1838-06-27' },
    { name: 'Kabir Das', dob: '1440-06-01' },
    { name: 'Rahul Gandhi', dob: '1970-06-19' },
    { name: 'Vijay', dob: '1974-06-22' },
    { name: 'Kajal Aggarwal', dob: '1985-06-19' },
    { name: 'Kumar Mangalam Birla', dob: '1967-06-14' },
    { name: 'PT Usha', dob: '1964-06-27' },
    { name: 'Leander Paes', dob: '1973-06-17' },
    { name: 'Vikram Seth', dob: '1952-06-20' },
    { name: 'Mani Ratnam', dob: '1956-06-02' },
    { name: 'Dinesh Karthik', dob: '1985-06-01' },
  ],
  7: [
    { name: 'Bal Gangadhar Tilak', dob: '1856-07-23' },
    { name: 'Chandra Shekhar Azad', dob: '1906-07-23' },
    { name: 'Ranveer Singh', dob: '1985-07-06' },
    { name: 'Priyanka Chopra', dob: '1982-07-18' },
    { name: 'Katrina Kaif', dob: '1983-07-16' },
    { name: 'MS Dhoni', dob: '1981-07-07' },
    { name: 'Sunil Gavaskar', dob: '1949-07-10' },
    { name: 'Sourav Ganguly', dob: '1972-07-08' },
    { name: 'Harbhajan Singh', dob: '1980-07-03' },
    { name: 'Smriti Mandhana', dob: '1996-07-18' },
    { name: 'Mukesh', dob: '1923-07-22' },
    { name: 'Sonu Nigam', dob: '1973-07-30' },
  ],
  8: [
    { name: 'Tulsidas', dob: '1532-08-11' },
    { name: 'Sri Aurobindo', dob: '1872-08-15' },
    { name: 'Vikram Sarabhai', dob: '1919-08-12' },
    { name: 'Rajiv Gandhi', dob: '1944-08-20' },
    { name: 'Arvind Kejriwal', dob: '1968-08-16' },
    { name: 'Rajkummar Rao', dob: '1984-08-31' },
    { name: 'Kajol', dob: '1974-08-05' },
    { name: 'Sridevi', dob: '1963-08-13' },
    { name: 'Taapsee Pannu', dob: '1987-08-01' },
    { name: 'Kishore Kumar', dob: '1929-08-04' },
    { name: 'Narayana Murthy', dob: '1946-08-20' },
    { name: 'Satya Nadella', dob: '1967-08-19' },
  ],
  9: [
    { name: 'Bhagat Singh', dob: '1907-09-28' },
    { name: 'Vinoba Bhave', dob: '1895-09-11' },
    { name: 'Ishwar Chandra Vidyasagar', dob: '1820-09-26' },
    { name: 'Srila Prabhupada', dob: '1896-09-01' },
    { name: 'Swami Sivananda', dob: '1887-09-08' },
    { name: 'Sai Baba of Shirdi', dob: '1838-09-28' },
    { name: 'Sadhguru Jaggi Vasudev', dob: '1957-09-03' },
    { name: 'Mata Amritanandamayi', dob: '1953-09-27' },
    { name: 'Sarvepalli Radhakrishnan', dob: '1888-09-05' },
    { name: 'Narendra Modi', dob: '1950-09-17' },
    { name: 'Manmohan Singh', dob: '1932-09-26' },
    { name: 'Ranbir Kapoor', dob: '1982-09-28' },
  ],
  10: [
    { name: 'Mahatma Gandhi', dob: '1869-10-02' },
    { name: 'Sardar Vallabhbhai Patel', dob: '1875-10-31' },
    { name: 'Annie Besant', dob: '1847-10-01' },
    { name: 'Ashfaqulla Khan', dob: '1900-10-22' },
    { name: 'APJ Abdul Kalam', dob: '1931-10-15' },
    { name: 'Homi Bhabha', dob: '1909-10-30' },
    { name: 'Meghnad Saha', dob: '1893-10-06' },
    { name: 'Subrahmanyan Chandrasekhar', dob: '1910-10-19' },
    { name: 'Lal Bahadur Shastri', dob: '1904-10-02' },
    { name: 'Amitabh Bachchan', dob: '1942-10-11' },
    { name: 'Sunny Deol', dob: '1956-10-19' },
    { name: 'Rekha', dob: '1954-10-10' },
  ],
  11: [
    { name: 'Jawaharlal Nehru', dob: '1889-11-14' },
    { name: 'Maulana Abul Kalam Azad', dob: '1888-11-11' },
    { name: 'Bipin Chandra Pal', dob: '1858-11-07' },
    { name: 'CV Raman', dob: '1888-11-07' },
    { name: 'Amartya Sen', dob: '1933-11-03' },
    { name: 'Indira Gandhi', dob: '1917-11-19' },
    { name: 'Shah Rukh Khan', dob: '1965-11-02' },
    { name: 'Aishwarya Rai Bachchan', dob: '1973-11-01' },
    { name: 'Kamal Haasan', dob: '1954-11-07' },
    { name: 'Nayanthara', dob: '1984-11-18' },
    { name: 'Virat Kohli', dob: '1988-11-05' },
    { name: 'VVS Laxman', dob: '1974-11-01' },
  ],
  12: [
    { name: 'Subramania Bharati', dob: '1882-12-11' },
    { name: 'Ramana Maharshi', dob: '1879-12-30' },
    { name: 'Osho Rajneesh', dob: '1931-12-11' },
    { name: 'Baba Ramdev', dob: '1965-12-25' },
    { name: 'Srinivasa Ramanujan', dob: '1887-12-22' },
    { name: 'Atal Bihari Vajpayee', dob: '1924-12-25' },
    { name: 'Pranab Mukherjee', dob: '1935-12-11' },
    { name: 'Sonia Gandhi', dob: '1946-12-09' },
    { name: 'Sharad Pawar', dob: '1940-12-12' },
    { name: 'Salman Khan', dob: '1965-12-27' },
    { name: 'Rajesh Khanna', dob: '1942-12-29' },
    { name: 'Dilip Kumar', dob: '1922-12-11' },
  ],
};

// The two Western zodiac signs that span each calendar month, with the
// day boundary (the first sign runs up to and including `until`; the second
// begins the next day). Derived from WESTERN_ZODIAC_PROFILES date ranges.
const ZODIAC_SPAN: Record<number, { first: string; until: number; second: string }> = {
  1: { first: 'Capricorn', until: 19, second: 'Aquarius' },
  2: { first: 'Aquarius', until: 18, second: 'Pisces' },
  3: { first: 'Pisces', until: 20, second: 'Aries' },
  4: { first: 'Aries', until: 19, second: 'Taurus' },
  5: { first: 'Taurus', until: 20, second: 'Gemini' },
  6: { first: 'Gemini', until: 20, second: 'Cancer' },
  7: { first: 'Cancer', until: 22, second: 'Leo' },
  8: { first: 'Leo', until: 22, second: 'Virgo' },
  9: { first: 'Virgo', until: 22, second: 'Libra' },
  10: { first: 'Libra', until: 22, second: 'Scorpio' },
  11: { first: 'Scorpio', until: 21, second: 'Sagittarius' },
  12: { first: 'Sagittarius', until: 21, second: 'Capricorn' },
};

const MONTH_META: Record<number, { title: string; description: string }> = {
  1: { title: 'Famous Indians Born in January — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in January: Subhas Chandra Bose, Deepika Padukone, Hrithik Roshan and more, with Capricorn and Aquarius zodiac profiles.' },
  2: { title: 'Famous Indians Born in February — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in February: Sarojini Naidu, Shahid Kapoor, Sushma Swaraj and more, with Aquarius and Pisces zodiac profiles.' },
  3: { title: 'Famous Indians Born in March — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in March: Aamir Khan, Alia Bhatt, Saina Nehwal and more, with Pisces and Aries zodiac profiles.' },
  4: { title: 'Famous Indians Born in April — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in April: Bhimrao Ambedkar, Sachin Tendulkar, Mukesh Ambani and more, with Aries and Taurus zodiac profiles.' },
  5: { title: 'Famous Indians Born in May — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in May: Rabindranath Tagore, Madhuri Dixit, Mohanlal and more, with Taurus and Gemini zodiac profiles.' },
  6: { title: 'Famous Indians Born in June — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in June: Rahul Gandhi, PT Usha, Leander Paes and more, with Gemini and Cancer zodiac profiles.' },
  7: { title: 'Famous Indians Born in July — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in July: Priyanka Chopra, MS Dhoni, Ranveer Singh and more, with Cancer and Leo zodiac profiles.' },
  8: { title: 'Famous Indians Born in August — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in August: Kishore Kumar, Satya Nadella, Kajol and more, with Leo and Virgo zodiac profiles.' },
  9: { title: 'Famous Indians Born in September — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in September: Narendra Modi, Bhagat Singh, Ranbir Kapoor and more, with Virgo and Libra zodiac profiles.' },
  10: { title: 'Famous Indians Born in October — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in October: Mahatma Gandhi, APJ Abdul Kalam, Amitabh Bachchan and more, with Libra and Scorpio zodiac profiles.' },
  11: { title: 'Famous Indians Born in November — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in November: Jawaharlal Nehru, Shah Rukh Khan, Virat Kohli and more, with Scorpio and Sagittarius zodiac profiles.' },
  12: { title: 'Famous Indians Born in December — Birthdays & Zodiac | BornClock', description: 'Famous Indians born in December: Srinivasa Ramanujan, Salman Khan, Atal Bihari Vajpayee and more, with Sagittarius and Capricorn zodiac profiles.' },
};

function formatDOB(dob: string): string {
  const [y, m, d] = dob.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

export function MonthlyBirthdayArticle({ month }: { month: number }) {
  const monthName = MONTH_NAMES[month - 1];
  const celebs = CELEBS_BY_MONTH[month] || [];
  const span = ZODIAC_SPAN[month];
  const firstProfile = WESTERN_ZODIAC_PROFILES[span.first];
  const secondProfile = WESTERN_ZODIAC_PROFILES[span.second];
  const meta = MONTH_META[month];
  const slug = `famous-indians-born-in-${monthName.toLowerCase()}`;

  // Two other months for the Related Articles section.
  const relatedA = month === 12 ? 1 : month + 1;
  const relatedB = month === 1 ? 12 : month - 1;

  const FAQS = [
    {
      q: `Which famous Indians were born in ${monthName}?`,
      a: `Many notable Indians were born in ${monthName}, including ${celebs.slice(0, 4).map(c => c.name).join(', ')}. This month spans the ${span.first} and ${span.second} zodiac signs, so those born earlier in ${monthName} are usually ${span.first} while those born later are ${span.second}.`,
    },
    {
      q: `What zodiac signs are people born in ${monthName}?`,
      a: `People born in ${monthName} belong to one of two Western zodiac signs. If you were born on or before ${monthName} ${span.until}, your sign is ${span.first} (${firstProfile.date_range}). If you were born after ${monthName} ${span.until}, your sign is ${span.second} (${secondProfile.date_range}).`,
    },
    {
      q: `What is the personality of someone born in ${monthName}?`,
      a: `${span.first} personalities are known as ${firstProfile.strengths.slice(0, 3).join(', ').toLowerCase()}, while ${span.second} personalities tend to be ${secondProfile.strengths.slice(0, 3).join(', ').toLowerCase()}. Your exact traits depend on your specific date of birth, which BornClock analyses for free.`,
    },
    {
      q: `How can I find my full birthday profile if I was born in ${monthName}?`,
      a: `Enter your date of birth into the free BornClock birthday report. You will instantly see your Western zodiac sign, Vedic Rashi, Nakshatra, Chinese zodiac, Life Path number, lucky stone and more — all calculated from your ${monthName} birth date.`,
    },
    {
      q: `Which zodiac sign is luckier in ${monthName} — ${span.first} or ${span.second}?`,
      a: `Neither sign is inherently luckier. ${span.first} (ruled by ${firstProfile.ruling_planet}) and ${span.second} (ruled by ${secondProfile.ruling_planet}) simply express different strengths. BornClock presents zodiac profiles as cultural insight and self-reflection, never as a guaranteed forecast of luck or fortune.`,
    },
  ];

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `Famous Indians Born in ${monthName} — Birthdays & Zodiac`,
    description: meta.description,
    author: { '@type': 'Organization', name: 'BornClock' },
    publisher: { '@type': 'Organization', name: 'BornClock' },
    mainEntityOfPage: `https://bornclock.com/articles/${slug}/`,
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <SEO
        title={meta.title}
        description={meta.description}
        canonicalUrl={`/articles/${slug}`}
        ogType="article"
      />
      <JsonLd data={articleSchema} />
      <JsonLd data={faqSchema} />

      <main data-testid={`month-article-${month}`} className="min-h-screen bg-white">
        <article className="max-w-3xl mx-auto px-4 py-10">

          <h1 className="text-3xl sm:text-4xl font-black gradient-text-primary leading-tight mb-6">
            Famous Indians Born in {monthName}
          </h1>

          <p className="text-gray-700 leading-relaxed mb-4">
            {monthName} has given India some of its most influential figures — from freedom
            fighters and spiritual masters to cricketers, film stars and business titans.
            On this page you will find well-known Indians born in {monthName}, each with their
            date of birth and a link to a complete BornClock birthday profile covering their
            zodiac sign, Vedic Rashi, Nakshatra and Life Path number.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Everyone born in {monthName} falls under one of two Western zodiac signs.
            If your birthday is on or before {monthName} {span.until}, you are a{' '}
            <strong>{span.first}</strong>; if it is later in the month, you are a{' '}
            <strong>{span.second}</strong>. Both signs are explored below.
          </p>

          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 my-8 text-center">
            <p className="text-indigo-900 font-bold mb-3">
              Born in {monthName}? Discover your complete birthday profile in seconds.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-indigo-600 text-white font-bold px-6 py-3
                          rounded-full text-sm hover:bg-indigo-700 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            Zodiac Signs for {monthName} Birthdays
          </h2>
          {[
            { profile: firstProfile, note: `on or before ${monthName} ${span.until}` },
            { profile: secondProfile, note: `after ${monthName} ${span.until}` },
          ].map(({ profile, note }) => (
            <section key={profile.sign} className="mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-1">
                {profile.symbol} {profile.sign} — {profile.date_range}
              </h3>
              <div className="text-xs text-gray-500 mb-3">
                Born {note} · Element: {profile.element} · Ruling Planet: {profile.ruling_planet}
              </div>
              <p className="text-gray-700 leading-relaxed mb-3">{profile.personality_summary}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-green-700 mb-1">Strengths</h4>
                  <ul className="text-sm text-gray-600 space-y-0.5">
                    {profile.strengths.map(s => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-700 mb-1">Weaknesses</h4>
                  <ul className="text-sm text-gray-600 space-y-0.5">
                    {profile.weaknesses.map(w => <li key={w}>• {w}</li>)}
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Lucky stone: </strong>{profile.lucky_stone} ·{' '}
                <strong>Lucky day: </strong>{profile.lucky_day}
              </p>
            </section>
          ))}

          <h2 className="text-2xl font-black text-gray-900 mb-4">
            {celebs.length} Famous Indians Born in {monthName}
          </h2>
          <ul className="divide-y divide-gray-200 border-y border-gray-200 mb-8">
            {celebs.map(c => (
              <li key={c.name} className="py-3 flex items-center justify-between gap-4">
                <a href={`/celebrity/${celebritySlug(c.name)}/`}
                   className="font-semibold text-indigo-700 hover:text-indigo-900 hover:underline">
                  {c.name}
                </a>
                <span className="text-sm text-gray-500 whitespace-nowrap">{formatDOB(c.dob)}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-black text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 mb-10">
            {FAQS.map((f, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{f.q}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl
               p-8 text-center text-white mt-10">
            <h2 className="text-2xl font-black mb-2">Find Your Own Birthday Profile</h2>
            <p className="text-indigo-200 mb-6">
              Share a birthday with someone famous? BornClock reveals your Western zodiac,
              Vedic Rashi, Nakshatra, Chinese zodiac, Life Path number, lucky stone and more —
              all free, from your date of birth.
            </p>
            <a href="/birthday-report"
               className="inline-block bg-white text-indigo-700 font-black px-8 py-3
                          rounded-full text-lg hover:bg-indigo-50 transition-colors">
              Generate My Free Birthday Profile →
            </a>
          </div>

          <div className="mt-12 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-black text-gray-900 mb-3">Related Articles</h2>
            <ul className="space-y-2">
              <li>
                <a href={`/articles/famous-indians-born-in-${MONTH_NAMES[relatedA - 1].toLowerCase()}`}
                   className="text-indigo-700 hover:underline">
                  Famous Indians Born in {MONTH_NAMES[relatedA - 1]}
                </a>
              </li>
              <li>
                <a href={`/articles/famous-indians-born-in-${MONTH_NAMES[relatedB - 1].toLowerCase()}`}
                   className="text-indigo-700 hover:underline">
                  Famous Indians Born in {MONTH_NAMES[relatedB - 1]}
                </a>
              </li>
              <li>
                <a href="/articles/numerology-by-date-of-birth"
                   className="text-indigo-700 hover:underline">
                  Numerology by Date of Birth — Find Your Life Path Number
                </a>
              </li>
            </ul>
          </div>

        </article>
      </main>
    </>
  );
}

export default MonthlyBirthdayArticle;
