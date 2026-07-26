import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export default function HowManyDaysUntilMyBirthday() {
  const breadcrumbSchema = { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [ { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://bornclock.com" }, { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://bornclock.com/faq" }, { "@type": "ListItem", "position": 3, "name": "How many days until my birthday?", "item": "https://bornclock.com/answers/how-many-days-until-my-birthday" } ] };
  const articleSchema = { "@context": "https://schema.org", "@type": "Article", "headline": "How Many Days Until My Birthday? Count the Exact Days", "description": "Work out exactly how many days until your next birthday, why the number changes each year, and how leap years shift the count. Includes weeks, hours and half-birthday math.", "author": { "@type": "Organization", "name": "BornClock" }, "publisher": { "@type": "Organization", "name": "BornClock", "logo": { "@type": "ImageObject", "url": "https://bornclock.com/bornclock-logo.png" } }, "datePublished": "2026-07-27", "dateModified": "2026-07-27", "mainEntityOfPage": "https://bornclock.com/answers/how-many-days-until-my-birthday" };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How do I calculate how many days until my birthday?", "acceptedAnswer": { "@type": "Answer", "text": "Take your next birthday's date (this year if it hasn't happened yet, otherwise next year) and count the whole days from today to that date. If today is your birthday, the count is 0. The simplest reliable method is to subtract today's date from your next birthday's date in a calendar or age tool rather than counting months by hand, because months have different lengths." } },
      { "@type": "Question", "name": "Why does the number of days until my birthday change from year to year?", "acceptedAnswer": { "@type": "Answer", "text": "Because the gap between two of the same calendar dates is 365 days in a common year and 366 days in a leap year. Whether a February 29 falls between today and your birthday shifts the count by one day, so the same 'days until' figure is rarely identical two years running." } },
      { "@type": "Question", "name": "How do leap years affect the countdown?", "acceptedAnswer": { "@type": "Answer", "text": "A leap year adds February 29. If that extra day sits between today and your next birthday, there is one more day to count. In the Gregorian calendar a year is a leap year if it is divisible by 4, except century years, which must be divisible by 400 — so 2000 was a leap year but 1900 and 2100 are not." } },
      { "@type": "Question", "name": "How many days until my half-birthday?", "acceptedAnswer": { "@type": "Answer", "text": "Your half-birthday is the date exactly six months from your birthday. To find days until it, count from today to the date six calendar months after (or before) your birth date. It is a fun midpoint some people mark between birthdays." } }
    ]
  };

  return (
    <>
      <SEO
        title="How Many Days Until My Birthday? Count the Exact Days | BornClock"
        description="Work out exactly how many days until your next birthday, why the number changes each year, and how leap years shift the count. Weeks, hours and half-birthday math too."
        canonicalUrl="/answers/how-many-days-until-my-birthday"
        ogType="article"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <nav className="text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/faq" className="hover:text-indigo-600">FAQ</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-600">How many days until my birthday?</span>
          </nav>

          <h1 className="text-3xl font-black text-gray-900 mb-2">How Many Days Until My Birthday?</h1>
          <p className="text-indigo-500 italic text-sm mb-8">Know your time. Live it well.</p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-xl p-5 mb-8">
            <p className="text-base font-semibold text-indigo-900 leading-relaxed">
              To find how many days until your birthday, count the whole days from today to your next birthday — this year if it hasn't happened yet, otherwise next year. If today is your birthday, the answer is 0. Because months are different lengths and leap years add a February 29, the reliable way is to subtract the two dates directly rather than counting months by hand.
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <h2 className="text-xl font-bold text-gray-900">The simplest method</h2>
            <p>Pick your <strong>next</strong> birthday. If your birthday later this year still lies ahead, use that date; if it has already passed, use the same date next year. Then count the number of whole days from today up to that date. Counting by months is error-prone because a month can be 28, 29, 30, or 31 days — so it's far safer to work in days directly, which is exactly what an age or countdown tool does.</p>

            <h2 className="text-xl font-bold text-gray-900">Why the number changes every year</h2>
            <p>The distance between the same two calendar dates is <strong>365 days in a common year and 366 days in a leap year</strong>. Whether a February 29 falls in the window between today and your birthday nudges the count by one day. That's why "days until my birthday" is rarely the identical figure two years running, even measured from the same time of year.</p>

            <h2 className="text-xl font-bold text-gray-900">How leap years shift the count</h2>
            <p>A leap year inserts <strong>February 29</strong>. If that extra day sits between today and your next birthday, there is one more day to count. The Gregorian rule: a year is a leap year if it is divisible by 4, <em>except</em> century years, which must also be divisible by 400. So 2000 was a leap year, but 1900 and 2100 are not. People born on February 29 ("leaplings") only get a calendar birthday every four years, and usually mark it on February 28 or March 1 in common years.</p>

            <h2 className="text-xl font-bold text-gray-900">Other ways to express the wait</h2>
            <p>Once you know the days, the rest is simple arithmetic:</p>
            <ul className="list-disc pl-6 space-y-0.5 text-sm">
              <li><strong>Weeks:</strong> days ÷ 7 (e.g. 84 days = 12 weeks).</li>
              <li><strong>Hours:</strong> days × 24.</li>
              <li><strong>Minutes:</strong> days × 1,440.</li>
              <li><strong>Months (approximate):</strong> days ÷ 30.44, the average month length.</li>
            </ul>

            <h2 className="text-xl font-bold text-gray-900">What about my half-birthday?</h2>
            <p>Your <strong>half-birthday</strong> is the date exactly six months from your birthday — a fun midpoint some people mark, and a common workaround for summer-born kids who want a school-year celebration. To find days until it, count from today to the date six calendar months after (or before) your birth date.</p>

            <h2 className="text-xl font-bold text-gray-900">Turn the countdown into something bigger</h2>
            <p>The number of days until your birthday is really a countdown to a new personal year. BornClock turns your date of birth into a full portrait — your exact age down to the second, your zodiac across three traditions, the famous people who share your birthday, and a science-based look at the years ahead.</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 mt-10 text-center">
            <p className="text-lg font-bold text-gray-900 mb-2">Count Down to Your Next Birthday</p>
            <p className="text-sm text-gray-500 mb-4">Your exact age, next-birthday countdown, zodiac and birthday twins — from your date of birth</p>
            <Link to="/age-calculator"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
              Open the Age &amp; Birthday Calculator →
            </Link>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-500 uppercase mb-4">Related Questions</p>
            <div className="space-y-2">
              <Link to="/answers/how-to-calculate-age" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How do I calculate my exact age?</Link>
              <Link to="/answers/who-shares-my-birthday" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ Which famous people share my birthday?</Link>
              <Link to="/answers/what-is-my-zodiac-sign" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ What is my zodiac sign?</Link>
              <Link to="/answers/how-old-am-i-on-mars" className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-gray-700 hover:text-indigo-700">→ How old am I on Mars?</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
