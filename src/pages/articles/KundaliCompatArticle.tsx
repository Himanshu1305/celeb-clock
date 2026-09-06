import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { AuthNav } from '@/components/AuthNav';
import { Footer } from '@/components/Footer';
import { SEO, FAQSchema } from '@/components/SEO';

const FAQ = [
  { question: 'What is a good Ashtakoota score for marriage?', answer: 'A total of 18 or above out of 36 is generally considered acceptable, 24 and above is good, and 28 and above is excellent. 36 is a perfect (and very rare) match. Below 18 is considered challenging.' },
  { question: 'Which Koota is the most important?', answer: 'Nadi carries the highest weight (8 points) and is tied to health and progeny. A Nadi Dosha (both partners sharing the same Nadi) is treated as the most serious, though it can be cancelled by certain exceptions.' },
  { question: 'Can a low score be corrected?', answer: 'Traditional astrology recognises dosha cancellations (Nadi and Bhakoot Dosha exceptions) and remedies. Many astrologers also weigh the whole chart, not just the 36 points, so a low Guna Milan alone is rarely the final word.' },
  { question: 'Is Kundali matching only about the 36 points?', answer: 'No. Ashtakoota (Guna Milan) is the classic scoring system, but a complete analysis also examines Mangal Dosha, the 7th house, Venus and Jupiter placements, and the Dashas of both people.' },
];

export default function KundaliCompatArticle() {
  return (
    <div data-testid="kundali-compat-article" className="min-h-screen bg-gradient-cosmic">
      <SEO
        title="Kundali Matching Guide — Ashtakoota (36 Guna) Explained | BornClock"
        description="A complete guide to Kundali matching by Ashtakoota (Guna Milan): all eight kootas — Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi — scores, doshas and what a good match really means."
        canonicalUrl="/articles/kundali-compatibility"
        ogType="article"
      />
      <FAQSchema items={FAQ} />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <header className="flex justify-between items-center mb-8"><Navigation /><AuthNav /></header>

        <article className="prose prose-slate max-w-none text-foreground">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">Kundali Matching: The Complete Guide to Ashtakoota (Guna Milan)</h1>

          <p>In Vedic astrology, <strong>Kundali matching</strong> — also called <em>Guna Milan</em> or Ashtakoota Milan — is the traditional method used across India to assess the compatibility of two people before marriage. The system compares the birth stars (Nakshatras) and Moon signs (Rashis) of the prospective partners across eight distinct dimensions, or <strong>Kootas</strong>. Each Koota is assigned a maximum number of points, and the sum of all eight gives a total out of 36. This article explains every one of the eight factors in depth, what the scores mean, which doshas to watch for, and how to interpret a match honestly rather than superstitiously.</p>

          <p>The word Ashtakoota literally means "eight pillars." The eight pillars are Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot and Nadi. Together they carry a maximum of 36 points (Gunas). The higher the number of matching Gunas, the more harmonious the pairing is said to be. But as we will see, the raw number is only part of the story — the presence or absence of specific doshas can matter more than a single point difference.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">The Eight Kootas at a glance</h2>
          <p>Here is the full weighting used in the classic Ashtakoota system, from lowest to highest maximum score: <strong>Varna</strong> (1 point), <strong>Vashya</strong> (2 points), <strong>Tara</strong> (3 points), <strong>Yoni</strong> (4 points), <strong>Graha Maitri</strong> (5 points), <strong>Gana</strong> (6 points), <strong>Bhakoot</strong> (7 points), and <strong>Nadi</strong> (8 points). Notice how the weight climbs steadily: the factors tied to deep biological and psychological harmony carry the most points.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">1. Varna (1 point) — spiritual compatibility</h2>
          <p>Varna measures the spiritual and ego compatibility of the couple. Each Moon sign is assigned one of four Varnas — Brahmin, Kshatriya, Vaishya or Shudra — arranged in a hierarchy of spiritual development. Traditionally, the groom's Varna should be equal to or higher than the bride's for the point to be awarded. Varna is the lowest-weighted Koota precisely because modern practitioners treat rigid caste-like hierarchy with caution; it is best read as a note on temperament and outlook rather than social rank. Even when the point is not scored, it rarely by itself derails a match.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">2. Vashya (2 points) — mutual attraction and control</h2>
          <p>Vashya reflects the natural magnetism and the balance of influence between partners — who "attracts" or draws the other. Signs are grouped into categories such as human, quadruped, wild and aquatic, and the affinity between the two categories determines whether the full two points, one point, or zero are awarded. A strong Vashya score suggests the couple will feel a natural pull toward one another and be able to influence each other lovingly rather than through friction.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">3. Tara (3 points) — health and fortune</h2>
          <p>Tara, or Dina Koota, examines the birth-star compatibility as it relates to health, longevity and general good fortune. The count is taken from one partner's Nakshatra to the other's and back, and the remainders are checked against auspicious and inauspicious groupings. Favourable counts award the points; unfavourable counts reduce them. Tara is a reminder that Kundali matching was, at its heart, concerned with the wellbeing and prosperity of the new household, not merely romance.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">4. Yoni (4 points) — physical and sexual compatibility</h2>
          <p>Yoni assigns each Nakshatra an animal symbol — horse, elephant, snake, dog, cat, rat, cow, buffalo, tiger, hare, monkey, lion, mongoose and so on. The Koota measures instinctive and physical compatibility. Same-animal pairings score the full four points; friendly animals score well; neutral pairings score two; and natural enemies (for example horse and buffalo, or cat and rat) score zero. A weak Yoni score points to potential friction in physical intimacy and instinctive rapport, an area many couples find important to understand in advance.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">5. Graha Maitri (5 points) — mental and intellectual bond</h2>
          <p>Graha Maitri, or Rashi Adhipati, looks at the friendship between the lords of the two Moon signs. Because the Moon governs the mind in Vedic astrology, the relationship between the ruling planets speaks directly to intellectual and emotional understanding. When the sign lords are natural friends, communication flows easily; when they are enemies, the couple may find themselves talking past each other. At five points, Graha Maitri is heavily weighted because a shared mental wavelength sustains a marriage long after the initial attraction settles.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">6. Gana (6 points) — temperament</h2>
          <p>Gana classifies each Nakshatra as Deva (divine), Manushya (human) or Rakshasa (demonic) in temperament. These are not moral labels — they describe disposition. Deva natures are gentle and spiritual; Manushya natures are balanced and worldly; Rakshasa natures are intense and strong-willed. Matching Ganas (Deva–Deva, Manushya–Manushya, Rakshasa–Rakshasa) score the full six points. Deva–Manushya scores well. A Deva–Rakshasa pairing scores just one point, and a Manushya–Rakshasa pairing scores zero, reflecting the potential for clashing temperaments that need conscious effort to reconcile.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">7. Bhakoot (7 points) — emotional and financial welfare</h2>
          <p>Bhakoot, or Rashi Koota, evaluates the relative position of the two Moon signs, which is said to influence the emotional bond, family welfare and finances of the couple. Certain distances between the signs — the 6–8 (Shadashtak), 5–9 (Nabhanabhi) and 2–12 (Dwirdwadash) relationships — are considered inauspicious and create a <strong>Bhakoot Dosha</strong>, scoring zero. Other placements score the full seven points. Because Bhakoot touches on prosperity and long-term stability, a Bhakoot Dosha is taken seriously, though several classical cancellations exist.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">8. Nadi (8 points) — health and progeny</h2>
          <p>Nadi is the most heavily weighted Koota, worth eight points, and it is considered the most important of all. Each Nakshatra belongs to one of three Nadis — Adi (Vata), Madhya (Pitta) or Antya (Kapha) — echoing the three doshas of Ayurveda. If both partners share the same Nadi, a <strong>Nadi Dosha</strong> occurs and zero points are awarded; the concern traditionally relates to health and the wellbeing of children. Different Nadis award the full eight points. Because of its weight and its link to progeny, Nadi is the factor astrologers examine most carefully, and a Nadi Dosha usually prompts a deeper look at the whole chart and possible remedies.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">How to read the total score</h2>
          <p>Once all eight Kootas are added, the total out of 36 is interpreted along a simple scale. A score of <strong>18 or above is considered acceptable</strong> for marriage. <strong>24 and above is good.</strong> <strong>28 and above is excellent.</strong> A perfect <strong>36 is extremely rare</strong> and regarded as an ideal, almost unheard-of match. A total <strong>below 18 is considered challenging</strong>, suggesting the couple should look closely at where the points were lost and whether doshas are present.</p>

          <p>It is worth stressing that the number alone never tells the whole story. Two people with a modest score but no Nadi or Bhakoot Dosha may be far better matched than a couple with a higher raw number but a serious dosha. Equally, a skilled astrologer weighs Mangal Dosha (Mars affliction), the strength of the seventh house, and the running Dashas of both partners. Kundali matching is a tool for reflection and conversation, not a verdict.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Doshas and their cancellations</h2>
          <p>The two doshas that draw the most attention are Nadi Dosha and Bhakoot Dosha. Classical texts list exceptions that cancel them — for example, a Nadi Dosha may be waived when both partners share the same Moon sign but different Nakshatras, or the same Nakshatra but different padas. Bhakoot Dosha has its own cancellations tied to the sign lords' friendship. These nuances are why an experienced astrologer, or a careful reading of the full chart, matters more than a single automated number.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Calculate your match</h2>
          <p>You can compute your own eight-Koota breakdown instantly with our free tool. Enter both birth dates — and, for the most accurate Nakshatra, both birth times — to see every Koota scored, along with Nadi and Bhakoot Dosha checks.</p>
          <p><Link to="/kundali-match" className="text-indigo-600 font-semibold underline">Try the free Kundali matching calculator →</Link></p>
          <p>To understand a single person's chart in depth — Lagna, planetary positions, Nakshatra and Dasha — generate a full <Link to="/kundali" className="text-indigo-600 underline">Janam Kundali</Link>. And remember: astrology at its best is a mirror for self-understanding and honest conversation between partners, never a substitute for it.</p>

          <h2 className="text-2xl font-bold mt-8 mb-3">Frequently asked questions</h2>
          {FAQ.map((f, i) => (
            <div key={i} className="mb-3">
              <h3 className="font-semibold">{f.question}</h3>
              <p>{f.answer}</p>
            </div>
          ))}
        </article>
      </div>
      <Footer />
    </div>
  );
}
