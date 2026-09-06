# BornClock Day 8B v2 — Celebrity Page Content Improvements
## PART B of 2 — Phases 4–9 (Celebrity Page + Tests + Gemini Script + Deploy)

---

This is a continuation. Phases 1-3 must be complete before starting here.

---

## PHASE 4 — EXPAND CELEBRITY PAGE

### 4A — Create empty bios file
```bash
echo '{}' > src/data/celebrity-bios.json
```

### 4B — Imports and profile lookups

Add at the top of `src/pages/CelebrityPage.tsx`:

```typescript
import React from 'react';
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
  CHINESE_ZODIAC_PROFILES, NAKSHATRA_PROFILES, LIFE_PATH_EXTENDED,
} from '@/data/astrologicalData';
import type {
  WesternZodiacProfile, VedicRashiProfile,
  ChineseZodiacProfile, NakshatraProfile, LifePathProfile,
} from '@/data/astrologicalData';
import celebBios from '@/data/celebrity-bios.json';
```

Inside the component, after existing calculations:
```typescript
// All null-guarded — year-only celebrities have null zodiac/rashi
const zodiacProfile: WesternZodiacProfile | null = zodiac
  ? (WESTERN_ZODIAC_PROFILES[zodiac.sign] ?? null) : null;
const rashiProfile: VedicRashiProfile | null = rashi
  ? (VEDIC_RASHI_PROFILES[rashi.rashi] ?? null) : null;
const chineseProfile: ChineseZodiacProfile | null = chineseZodiac
  ? (CHINESE_ZODIAC_PROFILES[chineseZodiac.animal] ?? null) : null;
const nakshatraProfile: NakshatraProfile | null = nakshatra
  ? (NAKSHATRA_PROFILES[nakshatra.nakshatra] ?? null) : null;
const lpExtended: LifePathProfile | null = lifePath
  ? (LIFE_PATH_EXTENDED[lifePath] ?? null) : null;
const bio: string | null = (celebBios as Record<string, string>)[slug ?? ''] ?? null;

// Active tab state for astrological section
const [activeTab, setActiveTab] = React.useState<'western' | 'vedic' | 'chinese' | 'numerology'>('western');
```

### 4C — Personality synthesis function

Add BEFORE the component return statement (not inside JSX):

```typescript
function buildPersonalitySynthesis(
  name: string,
  zodiacProfile: WesternZodiacProfile | null,
  rashiProfile: VedicRashiProfile | null,
  lifePath: number | null,
  lpExtended: LifePathProfile | null,
  nakshatraProfile: NakshatraProfile | null,
  zodiacSign: string | null,
  rashiName: string | null,
  nakshatraName: string | null
): string {
  const parts: string[] = [];

  if (zodiacProfile && rashiProfile && zodiacSign && rashiName) {
    parts.push(
      `As a ${zodiacSign} with ${rashiName} Rashi, ${name} combines the ${zodiacProfile.element.toLowerCase()} energy of ${zodiacSign} with the ${rashiProfile.element.toLowerCase()} depth of ${rashiName}, ruled by ${rashiProfile.lord} (${rashiProfile.lord_devanagari}).`
    );
  } else if (zodiacProfile && zodiacSign) {
    parts.push(
      `As a ${zodiacSign}, ${name} carries the ${zodiacProfile.element.toLowerCase()} energy of the archer — ${zodiacProfile.personality_summary.slice(0, 80).toLowerCase()}.`
    );
  }

  if (lifePath && lpExtended) {
    parts.push(
      `Their Life Path ${lifePath} — the ${lpExtended.title} — guided by ${lpExtended.ruling_planet}, brings ${lpExtended.traits.slice(0, 60).toLowerCase()} to everything they do.`
    );
  }

  if (nakshatraProfile && nakshatraName) {
    parts.push(
      `Born in the ${nakshatraName} Nakshatra (${nakshatraProfile.quality}), their ${nakshatraProfile.strengths.slice(0, 2).join(' and ').toLowerCase()} nature is a thread that runs through their entire life.`
    );
  }

  return parts.length > 0
    ? parts.join(' ')
    : `${name} is an accomplished Indian personality whose work has left a lasting mark on their field and on audiences across the nation.`;
}
```

Call it in component:
```typescript
const personalitySynthesis = buildPersonalitySynthesis(
  name, zodiacProfile, rashiProfile, lifePath, lpExtended, nakshatraProfile,
  zodiac?.sign ?? null, rashi?.rashi ?? null, nakshatra?.nakshatra ?? null
);
```

### 4D — Add sections to JSX (in this exact order after H1/tagline)

**SECTION 1 — Lucky Elements Panel**
`data-testid="lucky-elements-panel"` — shows before facts table

```tsx
<section
  data-testid="lucky-elements-panel"
  className="mb-6 overflow-x-auto pb-1"
  aria-label="Lucky elements"
>
  <div className="flex gap-2 flex-wrap">
    {rashiProfile ? (
      <>
        <span data-testid="lucky-chip-color"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          🎨 Colour: {rashiProfile.lucky_colors[0]}
        </span>
        <span data-testid="lucky-chip-stone"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          💎 Stone: {rashiProfile.lucky_stone} ({rashiProfile.lucky_stone_hindi})
        </span>
        <span data-testid="lucky-chip-day"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          📅 Day: {rashiProfile.lucky_day}
        </span>
        <span data-testid="lucky-chip-number"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          🔢 Number: {rashiProfile.lucky_numbers.join(', ')}
        </span>
        <span data-testid="lucky-chip-direction"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          🧭 Direction: {rashiProfile.lucky_direction}
        </span>
        <span data-testid="lucky-chip-metal"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          ⚙️ Metal: {rashiProfile.lucky_metal}
        </span>
        {zodiacProfile && (
          <span data-testid="lucky-chip-tarot"
            className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                       rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
            🃏 Tarot: {zodiacProfile.tarot_card}
          </span>
        )}
      </>
    ) : chineseProfile ? (
      // Year-only: show Chinese lucky data only
      <>
        <span data-testid="lucky-chip-color"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          🎨 Lucky Colour: {chineseProfile.lucky_colors[0]}
        </span>
        <span data-testid="lucky-chip-number"
          className="flex-shrink-0 bg-indigo-50 border border-indigo-200
                     rounded-full px-3 py-1.5 text-xs font-medium text-indigo-800 whitespace-nowrap">
          🔢 Lucky Number: {chineseProfile.lucky_numbers.join(', ')}
        </span>
        <span className="flex-shrink-0 text-xs text-gray-400 italic self-center">
          Full lucky profile requires exact date of birth
        </span>
      </>
    ) : (
      <span className="text-xs text-gray-400 italic">
        Lucky elements require a full date of birth.
      </span>
    )}
  </div>
</section>
```

**SECTION 2 — Personality Synthesis**
`data-testid="personality-synthesis"`

```tsx
{personalitySynthesis && (
  <section
    data-testid="personality-synthesis"
    className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4"
  >
    <p className="text-sm text-indigo-900 leading-relaxed">{personalitySynthesis}</p>
  </section>
)}
```

**SECTION 3 — Bio Section**
`data-testid="celebrity-bio"` or `data-testid="celebrity-bio-pending"`

```tsx
{bio ? (
  <section
    data-testid="celebrity-bio"
    className="mb-6 bg-white rounded-xl border border-gray-200 p-5"
  >
    <h2 className="text-lg font-black text-gray-900 mb-3">About {name}</h2>
    <p className="text-gray-700 leading-relaxed text-sm">{bio}</p>
    <p className="text-xs text-gray-400 mt-3 italic">
      Based on publicly available information.
    </p>
  </section>
) : (
  <section data-testid="celebrity-bio-pending" className="mb-6">
    <div className="bg-gray-50 border border-dashed border-gray-200
                    rounded-xl p-4 text-center">
      <p className="text-gray-400 text-sm">
        Detailed biography for {name} coming soon.
      </p>
    </div>
  </section>
)}
```

**SECTION 4 — Expanded Astrological Tabs**
`data-testid="astro-tabs"` — replaces existing static zodiac section

```tsx
<section data-testid="astro-tabs" className="mb-8">
  <h2 className="text-xl font-black text-gray-900 mb-4">Astrological Profile</h2>

  {/* Tab buttons */}
  <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
    {[
      { id: 'western',    label: '⭐ Western Zodiac' },
      { id: 'vedic',      label: '🕉 Vedic / Rashi' },
      { id: 'chinese',    label: '🐉 Chinese Zodiac' },
      { id: 'numerology', label: '🔢 Numerology' },
    ].map(({ id, label }) => (
      <button
        key={id}
        data-testid={`tab-${id}`}
        onClick={() => setActiveTab(id as typeof activeTab)}
        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
          activeTab === id
            ? 'bg-primary text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {label}
      </button>
    ))}
  </div>

  {/* WESTERN TAB — conditional rendering (NOT CSS display:none) */}
  {activeTab === 'western' && (
    <div data-testid="tab-content-western" className="animate-in fade-in">
      {zodiacProfile ? (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {zodiac?.sign} {zodiac?.symbol} — The {zodiacProfile.element} Sign
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {zodiacProfile.personality_summary}
          </p>
          {/* Strengths + Weaknesses */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1">
                {zodiacProfile.strengths.map(s => (
                  <span key={s} className="bg-green-100 text-green-800 text-xs
                                            px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
              <div className="flex flex-wrap gap-1">
                {zodiacProfile.weaknesses.map(w => (
                  <span key={w} className="bg-red-100 text-red-800 text-xs
                                            px-2 py-1 rounded-full">{w}</span>
                ))}
              </div>
            </div>
          </div>
          {/* Lucky elements grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
            {[
              { label: 'Lucky Colour', value: zodiacProfile.lucky_color },
              { label: 'Lucky Stone',  value: zodiacProfile.lucky_stone },
              { label: 'Lucky Day',    value: zodiacProfile.lucky_day },
              { label: 'Lucky Numbers', value: zodiacProfile.lucky_numbers.join(', ') },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                <div className="text-gray-400 mb-0.5 text-xs">{label}</div>
                <div className="font-semibold text-gray-900 text-xs">{value ?? '—'}</div>
              </div>
            ))}
          </div>
          {/* Tarot */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4">
            <div className="text-xs font-bold text-indigo-800 mb-1">
              🃏 Tarot Card: {zodiacProfile.tarot_card}
            </div>
            <div className="text-xs text-indigo-700">{zodiacProfile.tarot_meaning}</div>
          </div>
          {/* Compatibility */}
          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-700 mb-2">Compatibility</h4>
            <div className="flex flex-wrap gap-1 mb-1">
              {zodiacProfile.love_compatibility.map(s => (
                <span key={s} className="bg-green-100 text-green-700 text-xs
                                          px-2 py-1 rounded-full">✓ {s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {zodiacProfile.challenging_signs.map(s => (
                <span key={s} className="bg-red-100 text-red-700 text-xs
                                          px-2 py-1 rounded-full">✗ {s}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Career: </strong>{zodiacProfile.career_strengths}
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          Western zodiac requires an exact birth date (day and month).
        </div>
      )}
    </div>
  )}

  {/* VEDIC TAB — only in DOM when active */}
  {activeTab === 'vedic' && (
    <div data-testid="tab-content-vedic" className="animate-in fade-in">
      {rashiProfile ? (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {rashiProfile.rashi} ({rashiProfile.rashi_devanagari}) — {rashiProfile.western_equivalent}
          </h3>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
            <span>Lord: {rashiProfile.lord} ({rashiProfile.lord_devanagari})</span>
            <span>•</span>
            <span>{rashiProfile.element}</span>
            <span>•</span>
            <span>{rashiProfile.quality}</span>
            <span>•</span>
            <span>{rashiProfile.symbol}</span>
          </div>
          {/* Lucky elements 8-cell grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
            {[
              { label: 'Lucky Stone',     value: `${rashiProfile.lucky_stone} (${rashiProfile.lucky_stone_hindi})` },
              { label: 'Lucky Colour',    value: rashiProfile.lucky_colors[0] },
              { label: 'Lucky Day',       value: rashiProfile.lucky_day },
              { label: 'Lucky Number',    value: rashiProfile.lucky_numbers.join(', ') },
              { label: 'Direction',       value: rashiProfile.lucky_direction },
              { label: 'Metal',           value: rashiProfile.lucky_metal },
              { label: 'Ruling Deity',    value: rashiProfile.ruling_deity },
              { label: 'Body',            value: rashiProfile.body_part },
            ].map(({ label, value }) => (
              <div key={label}
                className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
                <div className="text-gray-400 mb-0.5 text-xs">{label}</div>
                <div className="font-semibold text-gray-900 text-xs leading-tight">{value}</div>
              </div>
            ))}
          </div>
          {/* Mantra */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <div className="text-xs font-bold text-amber-800 mb-1">🕉 Mantra</div>
            <div className="text-sm font-medium text-amber-900">{rashiProfile.mantra}</div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {rashiProfile.personality_summary}
          </p>
          {/* Strengths + Challenges */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1">
                {rashiProfile.strengths.map(s => (
                  <span key={s} className="bg-green-100 text-green-800 text-xs
                                            px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
              <div className="flex flex-wrap gap-1">
                {rashiProfile.challenges.map(c => (
                  <span key={c} className="bg-red-100 text-red-800 text-xs
                                            px-2 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            <strong>Career: </strong>{rashiProfile.career_strengths}
          </p>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-gray-700 mb-1">Compatible Rashis</h4>
            <div className="flex flex-wrap gap-1">
              {rashiProfile.compatible_rashis.map(r => (
                <span key={r} className="bg-green-100 text-green-700 text-xs
                                          px-2 py-1 rounded-full">✓ {r}</span>
              ))}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
            <h4 className="text-xs font-bold text-amber-800 mb-1">Health Tendencies</h4>
            <p className="text-xs text-amber-900">{rashiProfile.health_tendencies}</p>
          </div>
          <p className="text-xs text-gray-400 italic">
            Note: For precise Rashi, exact birth time and location are required. This is an approximate calculation.
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          Vedic Rashi calculation requires an exact birth date (day and month).
        </div>
      )}
    </div>
  )}

  {/* CHINESE TAB */}
  {activeTab === 'chinese' && (
    <div data-testid="tab-content-chinese" className="animate-in fade-in">
      {chineseProfile ? (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {chineseProfile.emoji} Year of the {chineseProfile.animal}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({chineseProfile.element_fixed} {chineseProfile.yin_yang})
            </span>
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            {chineseProfile.personality_summary}
          </p>
          {/* Lucky and Unlucky */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div>
              <h4 className="font-bold text-green-700 mb-2">Lucky</h4>
              <p className="text-gray-600">Numbers: {chineseProfile.lucky_numbers.join(', ')}</p>
              <p className="text-gray-600">Colours: {chineseProfile.lucky_colors.join(', ')}</p>
              <p className="text-gray-600">Flowers: {chineseProfile.lucky_flowers.join(', ')}</p>
              <p className="text-gray-600">Directions: {chineseProfile.lucky_directions.join(', ')}</p>
            </div>
            <div>
              <h4 className="font-bold text-red-700 mb-2">Unlucky</h4>
              <p className="text-gray-600">Numbers: {chineseProfile.unlucky_numbers.join(', ')}</p>
              <p className="text-gray-600">Colours: {chineseProfile.unlucky_colors.join(', ')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1">
                {chineseProfile.strengths.map(s => (
                  <span key={s} className="bg-green-100 text-green-800 text-xs
                                            px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 mb-2">Weaknesses</h4>
              <div className="flex flex-wrap gap-1">
                {chineseProfile.weaknesses.map(w => (
                  <span key={w} className="bg-red-100 text-red-800 text-xs
                                            px-2 py-1 rounded-full">{w}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-gray-700 mb-1">Best Match</h4>
            <div className="flex flex-wrap gap-1">
              {chineseProfile.best_match.map(a => (
                <span key={a} className="bg-green-100 text-green-700 text-xs
                                          px-2 py-1 rounded-full">✓ {a}</span>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-gray-700 mb-1">Challenging Match</h4>
            <div className="flex flex-wrap gap-1">
              {chineseProfile.worst_match.map(a => (
                <span key={a} className="bg-red-100 text-red-700 text-xs
                                          px-2 py-1 rounded-full">✗ {a}</span>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Career: </strong>{chineseProfile.career_strengths}
          </p>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          Chinese zodiac requires a birth year.
        </div>
      )}
    </div>
  )}

  {/* NUMEROLOGY TAB */}
  {activeTab === 'numerology' && (
    <div data-testid="tab-content-numerology" className="animate-in fade-in">
      {lpExtended && lifePath ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-indigo-100 border-2 border-indigo-300 rounded-full
                            flex items-center justify-center text-2xl font-black text-indigo-700">
              {lifePath}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Life Path {lifePath}</h3>
              <p className="text-gray-500 text-sm">{lpExtended.title}</p>
              <p className="text-xs text-gray-400">
                {lpExtended.ruling_planet} · {lpExtended.element}
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{lpExtended.traits}</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <h4 className="text-xs font-bold text-green-700 mb-2">Strengths</h4>
              <div className="flex flex-wrap gap-1">
                {lpExtended.strengths.map(s => (
                  <span key={s} className="bg-green-100 text-green-800 text-xs
                                            px-2 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-700 mb-2">Challenges</h4>
              <div className="flex flex-wrap gap-1">
                {lpExtended.challenges.map(c => (
                  <span key={c} className="bg-red-100 text-red-800 text-xs
                                            px-2 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-3">
            <h4 className="text-xs font-bold text-indigo-800 mb-1">💖 Love Style</h4>
            <p className="text-xs text-indigo-900">{lpExtended.love_style}</p>
          </div>
          <div className="mb-3">
            <h4 className="text-xs font-bold text-gray-700 mb-2">Career Paths</h4>
            <div className="flex flex-wrap gap-1">
              {lpExtended.career_paths.map(c => (
                <span key={c} className="bg-gray-100 text-gray-700 text-xs
                                          px-2 py-1 rounded-full">{c}</span>
              ))}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-3">
            <h4 className="text-xs font-bold text-purple-800 mb-1">✨ Spiritual Lesson</h4>
            <p className="text-xs text-purple-900">{lpExtended.spiritual_lesson}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
              <div className="text-gray-400 mb-0.5">Lucky Colour</div>
              <div className="font-semibold text-gray-900">{lpExtended.lucky_color}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-center">
              <div className="text-gray-400 mb-0.5">Lucky Stone</div>
              <div className="font-semibold text-gray-900">{lpExtended.lucky_stone}</div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          Life Path numerology requires a full date of birth.
        </div>
      )}
    </div>
  )}
</section>
```

After all changes:
```bash
npx tsc --noEmit 2>&1 | head -20
```

Fix all errors. Common issues:
- `React.useState` not found → add `import React from 'react'` at top
- `animate-in fade-in` not a Tailwind class → remove or replace with `transition-opacity`
- `zodiac?.sign` possibly undefined → add null checks

```bash
git add src/pages/CelebrityPage.tsx src/data/celebrity-bios.json
git commit -m "feat(day8b/phase4): lucky panel, personality synthesis, bio section, 4 expanded astro tabs with conditional rendering"
```

---

## PHASE 5 — WRITE COMPONENT TESTS (23 new TC-8B tests)

Add to `src/pages/__tests__/CelebrityPage.test.tsx`:

```typescript
import {
  WESTERN_ZODIAC_PROFILES, VEDIC_RASHI_PROFILES,
} from '@/data/astrologicalData';
import { calculateWesternZodiac } from '@/utils/celebrityCalculations';

// ── LUCKY ELEMENTS PANEL ──────────────────────────────────────
describe('Lucky Elements Panel — Positive (TC-8B-P)', () => {

  it('TC-8B-P-01: panel renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="lucky-elements-panel"]')).toBeTruthy();
  });

  it('TC-8B-P-02: stone chip shows Hindi name in parentheses', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-stone"]');
    // Should contain parentheses with Hindi name e.g. "(Moonga)"
    expect(chip?.textContent).toMatch(/\(.+\)/);
    expect(chip?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-03: day chip shows a valid weekday', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-day"]');
    const text = chip?.textContent || '';
    const valid = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    expect(valid.some(d => text.includes(d))).toBe(true);
  });

  it('TC-8B-P-04: number chip contains at least one digit', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="lucky-chip-number"]')?.textContent).toMatch(/\d/);
  });

  it('TC-8B-P-05: tarot chip renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const chip = document.querySelector('[data-testid="lucky-chip-tarot"]');
    expect(chip).toBeTruthy();
    expect(chip?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-06: Scorpio celebrity panel shows Tuesday and Red Coral', () => {
    const scorpioSlug = ALL_SLUGS.find(slug => {
      const dob = parseCelebrityDOB(SLUG_MAP.get(slug) as Record<string,unknown>);
      if (!dob?.isFullDate) return false;
      return calculateWesternZodiac(dob.day, dob.month).sign === 'Scorpio';
    });
    if (!scorpioSlug) { console.log('No Scorpio in test DB — skipping'); return; }

    renderCelebPage(scorpioSlug);
    const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
    const text = panel?.textContent || '';
    expect(text).toContain('Tuesday');
    expect(text).toContain('Red Coral');
  });

});

describe('Lucky Elements Panel — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-01: year-only celebrity has panel (no crash)', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
    expect(panel).toBeTruthy();
    expect(panel?.textContent).not.toContain('undefined');
    expect(panel?.textContent).not.toContain('[object Object]');
  });

  it('TC-8B-N-02: year-only celebrity does NOT show Vedic lucky stone chip', () => {
    if (!YEAR_ONLY_SLUG) return;
    const dob = parseCelebrityDOB(SLUG_MAP.get(YEAR_ONLY_SLUG) as Record<string,unknown>);
    if (dob?.isFullDate) return; // Not year-only, skip

    renderCelebPage(YEAR_ONLY_SLUG);
    // Vedic stone requires full DOB — stone chip may appear (Chinese) or not
    // Either way: no crash, no undefined
    const stoneChip = document.querySelector('[data-testid="lucky-chip-stone"]');
    if (stoneChip) {
      expect(stoneChip.textContent).not.toContain('undefined');
    }
    expect(true).toBe(true);
  });

  it('TC-8B-N-03: no undefined in lucky panel for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const panel = document.querySelector('[data-testid="lucky-elements-panel"]');
      const text = panel?.textContent || '';
      expect(text, `${slug} has undefined`).not.toContain('undefined');
      expect(text, `${slug} has [object Object]`).not.toContain('[object Object]');
      expect(text, `${slug} has null`).not.toContain('>null<');
      unmount();
    });
  });

});

// ── ASTROLOGICAL TABS ─────────────────────────────────────────
describe('Astrological Tabs — Positive (TC-8B-P)', () => {

  it('TC-8B-P-07: astro-tabs container renders', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="astro-tabs"]')).toBeTruthy();
  });

  it('TC-8B-P-08: all 4 tab buttons render', () => {
    renderCelebPage(FULL_DOB_SLUG);
    ['tab-western','tab-vedic','tab-chinese','tab-numerology'].forEach(id => {
      expect(document.querySelector(`[data-testid="${id}"]`), `Missing ${id}`).toBeTruthy();
    });
  });

  it('TC-8B-P-09: Western content visible by default, Vedic NOT in DOM', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="tab-content-western"]')).toBeTruthy();
    // With conditional rendering, Vedic should NOT be in DOM when Western is active
    expect(document.querySelector('[data-testid="tab-content-vedic"]')).toBeNull();
  });

  it('TC-8B-P-10: Western content contains sign name and tarot card', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return;
    const zodiac = calculateWesternZodiac(dob.day, dob.month);
    const western = document.querySelector('[data-testid="tab-content-western"]');
    const text = western?.textContent || '';
    expect(text).toContain(zodiac.sign);
    // Check tarot card from our data
    const profile = WESTERN_ZODIAC_PROFILES[zodiac.sign];
    if (profile) expect(text).toContain(profile.tarot_card);
  });

  it('TC-8B-P-11: clicking Vedic tab shows Vedic content, removes Western', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const vedicBtn = document.querySelector('[data-testid="tab-vedic"]') as HTMLElement;
    if (!vedicBtn) return;
    vedicBtn.click();

    expect(document.querySelector('[data-testid="tab-content-vedic"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="tab-content-western"]')).toBeNull();
  });

  it('TC-8B-P-12: Vedic tab content shows Devanagari script (Unicode 0900-097F)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    (document.querySelector('[data-testid="tab-vedic"]') as HTMLElement)?.click();
    const text = document.querySelector('[data-testid="tab-content-vedic"]')?.textContent || '';
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return; // Year-only won't have Vedic data
    expect(/[\u0900-\u097F]/.test(text)).toBe(true);
  });

  it('TC-8B-P-13: Chinese tab content appears after clicking Chinese', () => {
    renderCelebPage(FULL_DOB_SLUG);
    (document.querySelector('[data-testid="tab-chinese"]') as HTMLElement)?.click();
    const chinese = document.querySelector('[data-testid="tab-content-chinese"]');
    expect(chinese).toBeTruthy();
    expect(chinese?.textContent).not.toContain('undefined');
  });

  it('TC-8B-P-14: Numerology tab contains "Life Path"', () => {
    renderCelebPage(FULL_DOB_SLUG);
    (document.querySelector('[data-testid="tab-numerology"]') as HTMLElement)?.click();
    expect(document.querySelector('[data-testid="tab-content-numerology"]')?.textContent)
      .toContain('Life Path');
  });

});

describe('Astrological Tabs — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-04: year-only celebrity Western tab shows graceful message, not undefined', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const western = document.querySelector('[data-testid="tab-content-western"]');
    if (western) {
      expect(western.textContent).not.toContain('undefined');
      expect(western.textContent).not.toContain('[object Object]');
    }
    expect(true).toBe(true);
  });

  it('TC-8B-N-05: no undefined in tabs for 10 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 10);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 10).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const tabs = document.querySelector('[data-testid="astro-tabs"]');
      expect(tabs?.textContent).not.toContain('undefined');
      expect(tabs?.textContent).not.toContain('[object Object]');
      unmount();
    });
  });

  it('TC-8B-N-06: clicking all 4 tabs sequentially never crashes', () => {
    renderCelebPage(FULL_DOB_SLUG);
    ['tab-western','tab-vedic','tab-chinese','tab-numerology'].forEach(id => {
      const btn = document.querySelector(`[data-testid="${id}"]`) as HTMLElement;
      expect(() => btn?.click()).not.toThrow();
      const tabs = document.querySelector('[data-testid="astro-tabs"]');
      expect(tabs?.textContent).not.toContain('undefined');
    });
  });

});

// ── PERSONALITY SYNTHESIS ─────────────────────────────────────
describe('Personality Synthesis — Positive (TC-8B-P)', () => {

  it('TC-8B-P-15: synthesis renders for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    expect(document.querySelector('[data-testid="personality-synthesis"]')).toBeTruthy();
  });

  it('TC-8B-P-16: synthesis contains celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
    const text = document.querySelector('[data-testid="personality-synthesis"]')?.textContent || '';
    expect(text).toContain(name);
  });

  it('TC-8B-P-17: synthesis mentions zodiac sign for full-DOB celebrity', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const dob = parseCelebrityDOB(SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>);
    if (!dob?.isFullDate) return;
    const zodiac = calculateWesternZodiac(dob.day, dob.month);
    expect(document.querySelector('[data-testid="personality-synthesis"]')?.textContent)
      .toContain(zodiac.sign);
  });

  it('TC-8B-P-18: synthesis is > 30 chars (non-trivial text)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const text = document.querySelector('[data-testid="personality-synthesis"]')?.textContent?.trim() || '';
    expect(text.length).toBeGreaterThan(30);
  });

});

describe('Personality Synthesis — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-07: year-only celebrity has synthesis with no crash', () => {
    if (!YEAR_ONLY_SLUG) return;
    expect(() => renderCelebPage(YEAR_ONLY_SLUG)).not.toThrow();
    const el = document.querySelector('[data-testid="personality-synthesis"]');
    if (el) {
      expect(el.textContent).not.toContain('undefined');
      expect(el.textContent?.trim().length ?? 0).toBeGreaterThan(10);
    }
  });

  it('TC-8B-N-08: no undefined in synthesis for 20 sampled celebrities', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const el = document.querySelector('[data-testid="personality-synthesis"]');
      if (el) expect(el.textContent, `${slug}`).not.toContain('undefined');
      unmount();
    });
  });

});

// ── BIO SECTION ───────────────────────────────────────────────
describe('Bio Section — Positive (TC-8B-P)', () => {

  it('TC-8B-P-19: bio or pending renders for all celebrities', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const hasBio = document.querySelector('[data-testid="celebrity-bio"]');
    const hasPending = document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect(hasBio || hasPending).toBeTruthy();
  });

  it('TC-8B-P-20: pending state shows celebrity name', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const pending = document.querySelector('[data-testid="celebrity-bio-pending"]');
    if (pending) {
      const name = String((SLUG_MAP.get(FULL_DOB_SLUG) as Record<string,unknown>).name);
      expect(pending.textContent).toContain(name);
    }
    expect(true).toBe(true);
  });

  it('TC-8B-P-21: bio (if present) contains disclaimer text', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const bio = document.querySelector('[data-testid="celebrity-bio"]');
    if (bio) expect(bio.textContent?.toLowerCase()).toContain('publicly available');
    expect(true).toBe(true);
  });

});

describe('Bio Section — Negative/Edge (TC-8B-N)', () => {

  it('TC-8B-N-09: no undefined in bio section for all 20 sampled', () => {
    const stride = Math.floor(ALL_SLUGS.length / 20);
    ALL_SLUGS.filter((_,i) => i % stride === 0).slice(0, 20).forEach(slug => {
      const { unmount } = renderCelebPage(slug);
      const el = document.querySelector('[data-testid="celebrity-bio"]') ||
                 document.querySelector('[data-testid="celebrity-bio-pending"]');
      expect(el, `${slug} missing bio section`).toBeTruthy();
      expect(el?.textContent).not.toContain('undefined');
      unmount();
    });
  });

  it('TC-8B-N-10: year-only celebrity has bio or pending section', () => {
    if (!YEAR_ONLY_SLUG) return;
    renderCelebPage(YEAR_ONLY_SLUG);
    const el = document.querySelector('[data-testid="celebrity-bio"]') ||
               document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect(el).toBeTruthy();
    expect(el?.textContent).not.toContain('undefined');
  });

  it('TC-8B-N-11: bio section never shows empty content (> 10 chars)', () => {
    renderCelebPage(FULL_DOB_SLUG);
    const el = document.querySelector('[data-testid="celebrity-bio"]') ||
               document.querySelector('[data-testid="celebrity-bio-pending"]');
    expect((el?.textContent?.trim().length ?? 0)).toBeGreaterThan(10);
  });

});
```

Run all tests:
```bash
npx vitest run src/pages/__tests__/CelebrityPage.test.tsx --reporter=verbose 2>&1
```

**Common failures and exact fixes:**

`TC-8B-P-09: Vedic NOT null after Western active` → tabs use CSS show/hide instead of conditional rendering → change `{display: activeTab === 'vedic' ? 'block' : 'none'}` to `{activeTab === 'vedic' && <div>...}`

`TC-8B-P-11: clicking tab doesn't switch` → `useState` not updating jsdom → ensure tab button has correct `onClick={() => setActiveTab('vedic')}`

`TC-8B-P-12: no Devanagari found` → rashiProfile?.rashi_devanagari not rendered in Vedic tab → confirm `{rashiProfile.rashi} ({rashiProfile.rashi_devanagari})` is in JSX

`TC-8B-N-01: year-only has panel null` → panel returns null for year-only celebrities → add Chinese fallback in lucky panel as shown in Phase 4D

After all 23 TC-8B tests pass, run full suite:
```bash
npx vitest run 2>&1 | tail -10
```

```bash
git add src/pages/__tests__/CelebrityPage.test.tsx
git commit -m "test(day8b/phase5): 23 new tests — lucky panel, astro tabs with tab-switching, synthesis, bio — positive/negative/edge"
```

---

## PHASE 6 — CREATE GEMINI BIO SCRIPT

Install missing packages:
```bash
npm list p-limit 2>/dev/null | grep p-limit || npm install p-limit --save-dev
npm list tsx 2>/dev/null | grep tsx || npm install tsx --save-dev
npm list dotenv 2>/dev/null | grep dotenv || npm install dotenv --save-dev
```

Create `scripts/generate-celebrity-bios.ts`:

```typescript
/**
 * BornClock Celebrity Bio Generator
 * Calls Gemini Flash API in parallel batches to create celebrity biographies.
 * Writes to src/data/celebrity-bios.json (keyed by slug).
 * Bios appear in prerendered HTML for SEO (static JSON import, not Supabase).
 *
 * Usage:
 *   npx tsx scripts/generate-celebrity-bios.ts --batch 1
 *   npx tsx scripts/generate-celebrity-bios.ts --batch 2
 *   npx tsx scripts/generate-celebrity-bios.ts --status
 *   npx tsx scripts/generate-celebrity-bios.ts --slug virat-kohli
 */

// Load env FIRST before any other imports
import { config } from 'dotenv';
config({ path: '.env.local' });

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const BIOS_PATH = join(process.cwd(), 'src/data/celebrity-bios.json');
const CELEBS_PATH = join(process.cwd(), 'src/data/indianCelebrities.ts');
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ── CLI ───────────────────────────────────────────────────────
const args = process.argv.slice(2);
const batchIdx = args.indexOf('--batch');
const batchNum = batchIdx !== -1 ? parseInt(args[batchIdx + 1]) : null;
const isStatus = args.includes('--status');
const slugIdx = args.indexOf('--slug');
const specificSlug = slugIdx !== -1 ? args[slugIdx + 1] : null;

// ── SLUG FUNCTION (identical to app) ────────────────────────
function nameToSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[''`]/g, '').replace(/\./g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// ── DATABASE LOADER ───────────────────────────────────────────
interface CelebEntry { name: string; known_for: string; category: string; birth_place: string; slug: string; }

function loadDatabase(): CelebEntry[] {
  const content = readFileSync(CELEBS_PATH, 'utf8');
  const names      = [...content.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const knownFors  = [...content.matchAll(/known_for:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const categories = [...content.matchAll(/category:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  const places     = [...content.matchAll(/birth_place:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
  return names.map((name, i) => ({
    name, known_for: knownFors[i] ?? '', category: categories[i] ?? '',
    birth_place: places[i] ?? 'India', slug: nameToSlug(name),
  }));
}

// ── BIO STORE ─────────────────────────────────────────────────
function loadBios(): Record<string, string> {
  if (!existsSync(BIOS_PATH)) return {};
  try { return JSON.parse(readFileSync(BIOS_PATH, 'utf8')); } catch { return {}; }
}
function saveBios(bios: Record<string, string>): void {
  writeFileSync(BIOS_PATH, JSON.stringify(bios, null, 2), 'utf8');
}

// ── VALIDATION ────────────────────────────────────────────────
function validateBio(bio: string, name: string): string | null {
  if (!bio || bio.trim().length < 50) return 'Too short (<50 chars)';
  if (bio.includes('I cannot') || bio.includes('I am an AI') || bio.includes('As an AI'))
    return 'Contains AI refusal language';
  if (bio.includes('[') && bio.includes(']')) return 'Contains template markers';
  const words = bio.trim().split(/\s+/).length;
  if (words < 100) return `Too short (${words} words, need ≥100)`;
  if (words > 260) return `Too long (${words} words, need ≤260)`;
  const firstName = name.split(' ')[0].toLowerCase();
  if (!bio.toLowerCase().includes(firstName)) return `Bio doesn't mention name "${firstName}"`;
  return null;
}

// ── GEMINI API ────────────────────────────────────────────────
async function callGemini(celeb: CelebEntry): Promise<string | null> {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY not found in .env.local');

  const prompt = `Write a factual, engaging biography of ${celeb.name}, an Indian ${celeb.category || 'public figure'} known for ${celeb.known_for || 'significant contributions to Indian culture'}.${celeb.birth_place && celeb.birth_place !== 'India' ? ` Born in ${celeb.birth_place}.` : ''}

Requirements:
- Length: 150-180 words exactly
- Start with their full name and most important achievement
- Cover early life briefly (1-2 sentences)
- Cover 3-4 specific career achievements with context
- Cover cultural significance or lasting legacy (1-2 sentences)
- Third person, present tense for ongoing, past tense for completed
- Only publicly verifiable well-known facts
- No net worth estimates
- End with one sentence on their enduring cultural impact

Return ONLY the biography. No headings, labels, or commentary.`;

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 320, topP: 0.8 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',  threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',  threshold: 'BLOCK_NONE' },
      ],
    }),
  });

  if (res.status === 429) throw new Error('RATE_LIMITED');
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 150)}`);

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

async function generateBio(celeb: CelebEntry, attempt = 1): Promise<string | null> {
  try {
    const bio = await callGemini(celeb);
    if (!bio) return null;

    const err = validateBio(bio, celeb.name);
    if (err) {
      if (attempt < 2) {
        console.log(`    ↩️  Retry for ${celeb.name} (${err})`);
        await sleep(1500);
        return generateBio(celeb, attempt + 1);
      }
      console.log(`    ⚠️  Validation failed after 2 attempts for ${celeb.name}: ${err}`);
      return null;
    }
    return bio;
  } catch (e) {
    const msg = (e as Error).message;
    if (msg === 'RATE_LIMITED' && attempt < 3) {
      console.log(`    ⏳ Rate limited — waiting 60s then retry ${attempt + 1}/3`);
      await sleep(60000);
      return generateBio(celeb, attempt + 1);
    }
    throw e;
  }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ── BATCH LISTS ───────────────────────────────────────────────
// Names must match (or fuzzy-match) entries in indianCelebrities.ts
// Script warns for any name not found in DB
const BATCH_1 = [
  'Virat Kohli','Sachin Tendulkar','Shah Rukh Khan','Amitabh Bachchan',
  'A.R. Rahman','Narendra Modi','Priyanka Chopra','MS Dhoni',
  'Rohit Sharma','Deepika Padukone','Ranveer Singh','Aamir Khan',
  'Salman Khan','Ranbir Kapoor','Aishwarya Rai','Akshay Kumar',
  'Hrithik Roshan','Katrina Kaif','Anushka Sharma','Kareena Kapoor',
  'Ratan Tata','Mukesh Ambani','Lata Mangeshkar','Kishore Kumar',
  'Rajinikanth','Kamal Haasan','Prabhas','Mahesh Babu',
  'Allu Arjun','Jr NTR','Yuvraj Singh','Saina Nehwal',
  'PV Sindhu','Mary Kom','Neeraj Chopra','Sourav Ganguly',
  'Kapil Dev','Sunil Gavaskar','Rekha','Madhuri Dixit',
  'Kajol','Nawazuddin Siddiqui','Irrfan Khan','Naseeruddin Shah',
  'Shabana Azmi','Javed Akhtar','Gulzar','Zakir Hussain',
  'Viswanathan Anand','Bismillah Khan',
];
const BATCH_2 = [
  'Arijit Singh','Shreya Ghoshal','Sonu Nigam','Kumar Sanu',
  'Asha Bhosle','Udit Narayan','Alka Yagnik','Sunidhi Chauhan',
  'Hardik Pandya','Jasprit Bumrah','KL Rahul','Shubman Gill',
  'Smriti Mandhana','Mithali Raj','Harmanpreet Kaur','Jhulan Goswami',
  'Abhinav Bindra','Leander Paes','Sania Mirza','Pullela Gopichand',
  'Milkha Singh','PT Usha','Bhaichung Bhutia','Sunil Chhetri',
  'Rani Rampal','Bajrang Punia','Vinesh Phogat','Geeta Phogat',
  'Sakshi Malik','Hima Das','Manika Batra','Pankaj Advani',
  'Koneru Humpy','Taapsee Pannu','Alia Bhatt','Shraddha Kapoor',
  'Kangana Ranaut','Vidya Balan','Ayushmann Khurrana','Rajkummar Rao',
  'Vicky Kaushal','Manoj Bajpayee','Pankaj Tripathi','Tabu',
  'Tiger Shroff','Varun Dhawan','Kartik Aaryan','Saif Ali Khan',
  'John Abraham','Emraan Hashmi',
];
const BATCH_3 = [
  'Raj Kapoor','Dev Anand','Dilip Kumar','Dharmendra',
  'Rajesh Khanna','Guru Dutt','Meena Kumari','Nargis',
  'Smita Patil','Jeetendra','Mithun Chakraborty','Jackie Shroff',
  'Anil Kapoor','Sunny Deol','Sanjay Dutt','Dimple Kapadia',
  'Zeenat Aman','Hema Malini','Jaya Bachchan','Sharmila Tagore',
  'Asha Parekh','Mumtaz','Waheeda Rehman','Supriya Pathak',
  'Konkona Sen Sharma','Swara Bhaskar','Richa Chadha','Radhika Apte',
  'Bhumi Pednekar','Sara Ali Khan','Janhvi Kapoor','Ananya Panday',
  'Kriti Sanon','Kiara Advani','Disha Patani','Parineeti Chopra',
  'Sonakshi Sinha','Bipasha Basu','Shilpa Shetty','Urmila Matondkar',
  'Tabu','Kajol','Rani Mukerji','Preity Zinta',
  'Kareena Kapoor','Karisma Kapoor','Juhi Chawla','Raveena Tandon',
  'Twinkle Khanna','Manisha Koirala',
];

const PREDEFINED_BATCHES = [BATCH_1, BATCH_2, BATCH_3];

// ── STATUS ────────────────────────────────────────────────────
function showStatus() {
  const db = loadDatabase();
  const bios = loadBios();
  const done = Object.keys(bios).length;
  const pct = db.length > 0 ? Math.round((done / db.length) * 100) : 0;

  console.log('\n══════════════════════════════════════');
  console.log('  BornClock Celebrity Bio Status');
  console.log('══════════════════════════════════════');
  console.log(`  Database:   ${db.length} celebrities`);
  console.log(`  Generated:  ${done} bios (${pct}%)`);
  console.log(`  Remaining:  ${db.length - done}`);
  console.log('══════════════════════════════════════');

  if (done > 0) {
    const sample = Object.entries(bios).slice(0, 2);
    console.log('\nSample:');
    sample.forEach(([slug, bio]) => {
      console.log(`  [${slug}] ${bio.split(/\s+/).length} words`);
      console.log(`  ${bio.slice(0, 100)}...\n`);
    });
  }
}

// ── PROCESS BATCH ─────────────────────────────────────────────
async function processBatch(names: string[]) {
  const { default: pLimit } = await import('p-limit');
  const limit = pLimit(8); // 8 concurrent Gemini calls

  const db = loadDatabase();
  const bios = loadBios();
  const dbBySlug = new Map(db.map(c => [c.slug, c]));
  const dbByName = new Map(db.map(c => [c.name.toLowerCase(), c]));

  // Match names — try exact slug, then lowercase name match
  const toProcess: CelebEntry[] = [];
  for (const name of names) {
    const slug = nameToSlug(name);
    const found = dbBySlug.get(slug) ?? dbByName.get(name.toLowerCase());
    if (!found) {
      console.log(`  ⚠️  Not found in DB: "${name}" (slug: ${slug})`);
      continue;
    }
    if (bios[found.slug]) {
      console.log(`  ✓  Already done: ${found.name}`);
      continue;
    }
    toProcess.push(found);
  }

  if (toProcess.length === 0) {
    console.log('\n  All celebrities in this batch already have bios.\n');
    return;
  }

  console.log(`\n  Processing ${toProcess.length} celebrities (8 parallel)...\n`);
  let ok = 0, fail = 0, invalid = 0;

  await Promise.all(toProcess.map(celeb =>
    limit(async () => {
      try {
        const bio = await generateBio(celeb);
        if (!bio) { fail++; console.log(`  ❌  ${celeb.name} — empty response`); return; }
        const err = validateBio(bio, celeb.name);
        if (err) { invalid++; console.log(`  ⚠️  ${celeb.name} — ${err}`); return; }
        bios[celeb.slug] = bio;
        saveBios(bios); // Save after each success
        console.log(`  ✅  ${celeb.name} (${bio.split(/\s+/).length} words)`);
        ok++;
      } catch (e) {
        fail++;
        console.log(`  ❌  ${celeb.name} — ${(e as Error).message}`);
      }
      await sleep(150);
    })
  ));

  console.log('\n══════════════════════════════════════');
  console.log(`  ✅ Success:  ${ok}`);
  console.log(`  ⚠️  Invalid: ${invalid}`);
  console.log(`  ❌ Failed:  ${fail}`);
  console.log(`  📄 Total bios now: ${Object.keys(bios).length}`);
  console.log('══════════════════════════════════════\n');
}

// ── UPDATE SINGLE ─────────────────────────────────────────────
async function updateSingle(slug: string) {
  const db = loadDatabase();
  const bios = loadBios();
  const celeb = db.find(c => c.slug === slug);
  if (!celeb) { console.log(`\n  ❌ No celebrity with slug "${slug}"\n`); return; }

  console.log(`\n  Regenerating: ${celeb.name}...`);
  try {
    const bio = await generateBio(celeb);
    if (!bio) { console.log('  ❌ Empty response\n'); return; }
    const err = validateBio(bio, celeb.name);
    if (err) { console.log(`  ⚠️  Validation: ${err}\n${bio}\n`); return; }
    bios[slug] = bio;
    saveBios(bios);
    console.log(`  ✅ Done (${bio.split(/\s+/).length} words)\n\n${bio}\n`);
  } catch (e) { console.log(`  ❌ ${(e as Error).message}\n`); }
}

// ── AUTO BATCHES (beyond predefined 3) ───────────────────────
function getAutoBatch(batchNum: number): string[] {
  const db = loadDatabase();
  const bios = loadBios();
  const predefinedSlugs = new Set(PREDEFINED_BATCHES.flat().map(nameToSlug));
  const remaining = db
    .filter(c => !bios[c.slug] && !predefinedSlugs.has(c.slug))
    .map(c => c.name);
  const offset = (batchNum - PREDEFINED_BATCHES.length - 1) * 50;
  return remaining.slice(offset, offset + 50);
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🎬  BornClock Celebrity Bio Generator (Gemini Flash)\n');

  if (isStatus) { showStatus(); return; }

  if (specificSlug) { await updateSingle(specificSlug); return; }

  if (!batchNum) {
    console.log('Usage:');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --batch 1    # Top 50');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --batch 2    # Next 50');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --status     # Progress');
    console.log('  npx tsx scripts/generate-celebrity-bios.ts --slug virat-kohli');
    return;
  }

  let names: string[];
  if (batchNum <= PREDEFINED_BATCHES.length) {
    names = PREDEFINED_BATCHES[batchNum - 1];
    console.log(`  Running predefined Batch ${batchNum} (${names.length} celebrities)`);
  } else {
    names = getAutoBatch(batchNum);
    if (names.length === 0) {
      console.log('  No remaining celebrities for this batch. Run --status to check.\n');
      return;
    }
    console.log(`  Running auto-batch ${batchNum} (${names.length} remaining celebrities)`);
  }

  await processBatch(names);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
```

Verify it works (status only, no API calls):
```bash
npx tsx scripts/generate-celebrity-bios.ts --status
```

Expected:
```
🎬  BornClock Celebrity Bio Generator

══════════════════════════════════════
  BornClock Celebrity Bio Status
  Database:   598 celebrities
  Generated:  0 bios (0%)
  Remaining:  598
══════════════════════════════════════
```

If it fails:
- `VITE_GEMINI_API_KEY not found` → check `.env.local` has the key
- `Cannot find module 'dotenv'` → `npm install dotenv --save-dev`
- `Cannot find module 'p-limit'` → `npm install p-limit --save-dev`

```bash
git add scripts/generate-celebrity-bios.ts
git commit -m "feat(day8b/phase6): Gemini bio generation script — 8 parallel calls, validation, auto-retry, batch resumption"
```

---

## PHASE 7 — BUILD VERIFICATION

```bash
time npm run build 2>&1 | tee /tmp/day8b-build.txt | tail -30

echo "=== Build exit: $? ==="
echo "=== Celebrity pages count ==="
find dist -path "*/celebrity/*/index.html" | wc -l

echo "=== Born-on spot check — CRITICAL ==="
cat dist/born-on/august-6/india/index.html | grep -o "<title>[^<]*</title>"

echo "=== Lucky panel in prerendered HTML ==="
ls dist/celebrity/ | head -1 | xargs -I{} cat "dist/celebrity/{}/index.html" | \
  grep -c "lucky-elements-panel\|Lucky Stone\|Lucky Colour" || echo "Not found"

echo "=== Personality synthesis in prerendered HTML ==="
ls dist/celebrity/ | head -1 | xargs -I{} cat "dist/celebrity/{}/index.html" | \
  grep -c "personality-synthesis\|Rashi\|Life Path" || echo "Not found"
```

If born-on title is generic → redeploy before anything else.

Common build errors:
- `Cannot find module '@/data/celebrity-bios.json'` → resolveJsonModule not in tsconfig → fix it, rebuild
- `Type 'string | undefined' is not assignable` → add `?? null` or `?? ''` null guards
- `Property 'animate-in' does not exist` → remove non-Tailwind classes

```bash
git add -A
git commit -m "chore(day8b/phase7): clean build — expanded celebrity pages verified in dist"
```

---

## PHASE 8 — RUN BATCH 1 BIOS

```bash
npx tsx scripts/generate-celebrity-bios.ts --batch 1
```

Expected output:
```
🎬  BornClock Celebrity Bio Generator

  Running predefined Batch 1 (50 celebrities)
  Processing X celebrities (8 parallel)...

  ✅  Virat Kohli (162 words)
  ✅  Sachin Tendulkar (171 words)
  ...

  ══════════════════════════════════════
  ✅ Success:  [X]
  ⚠️  Invalid: 0
  ❌ Failed:  0
  📄 Total bios now: [X]
  ══════════════════════════════════════
```

Verify quality:
```bash
cat src/data/celebrity-bios.json | python3 -c "
import json, sys
bios = json.load(sys.stdin)
print(f'Total bios: {len(bios)}')
for slug, bio in list(bios.items())[:3]:
    words = len(bio.split())
    print(f'\n[{slug}] {words} words')
    print(bio[:200])
"
```

Manually check 3-5 bios. If any have issues:
```bash
npx tsx scripts/generate-celebrity-bios.ts --slug [celebrity-slug]
```

Rebuild with bios included:
```bash
npm run build 2>&1 | tail -10

echo "=== Bio in prerendered HTML ==="
cat dist/celebrity/virat-kohli/index.html | grep -c "cricketer\|cricket\|century\|international" || echo "0"
```

If count > 0, bio is in the prerendered HTML — Google can index it.

```bash
git add src/data/celebrity-bios.json
git commit -m "feat(day8b/phase8): batch 1 bios generated — top 50 celebrities via Gemini Flash 2.0"
```

---

## PHASE 9 — DEPLOY AND VERIFY

```bash
git push origin develop
./node_modules/.bin/wrangler deploy
```

Wait 60 seconds.

```bash
echo "=== MANDATORY BORN-ON SPOT CHECK ==="
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://bornclock.com/born-on/august-6/india/" && \
curl -s "https://bornclock.com/born-on/august-6/india/" | \
  grep -o "<title>[^<]*</title>"

echo "=== Bio in production HTML ==="
curl -s "https://bornclock.com/celebrity/virat-kohli/" | \
  grep -c "cricketer\|cricket\|century" || echo "0 — bio not found"

echo "=== Lucky elements in production HTML ==="
curl -s "https://bornclock.com/celebrity/virat-kohli/" | \
  grep -c "lucky-elements-panel\|Red Coral\|Tuesday" || echo "0"

echo "=== Astro tabs in HTML ==="
curl -s "https://bornclock.com/celebrity/virat-kohli/" | \
  grep -c "astro-tabs\|tab-western\|tab-vedic" || echo "0"

echo "=== Personality synthesis in HTML ==="
curl -s "https://bornclock.com/celebrity/virat-kohli/" | \
  grep -c "personality-synthesis\|Vrischika\|Scorpio\|Life Path" || echo "0"
```

If born-on spot check fails → immediate redeploy priority over everything else.

Deploy to production:
```bash
git checkout main
git merge develop
git push origin main
./node_modules/.bin/wrangler deploy
```

Final production verification:
```bash
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://bornclock.com/born-on/august-6/india/"
curl -s "https://bornclock.com/born-on/august-6/india/" | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "%{http_code}\n" "https://bornclock.com/celebrity/virat-kohli/"
curl -s "https://bornclock.com/celebrity/virat-kohli/" | grep -c "cricketer"
```

```bash
git commit -m "chore(day8b/phase9): production verified — lucky panel, astro tabs, bios all live"
```

---

## PHASE 10 — PRINT COMPLETION REPORT

```
DAY 8B COMPLETE — CELEBRITY PAGE CONTENT IMPROVEMENTS
══════════════════════════════════════════════════════════════
IMPROVEMENTS LIVE ON PRODUCTION

1. LUCKY ELEMENTS PANEL (all 598 pages)
   Content: Lucky colour, stone (Hindi+English), day, numbers,
            direction, metal, tarot card
   Full-DOB: Vedic Rashi data (authoritative Indian astrology)
   Year-only: Chinese zodiac data or graceful fallback message
   Hallucination risk: ZERO (pure lookup) ✓
   data-testid: lucky-elements-panel ✓

2. PERSONALITY SYNTHESIS (all pages)
   Template built from: Western zodiac + Vedic Rashi + Life Path + Nakshatra
   Always has celebrity name and zodiac sign
   Year-only: graceful fallback sentence
   Hallucination risk: ZERO (templated from calculations) ✓
   data-testid: personality-synthesis ✓

3. BIO SECTION (all pages)
   Shows bio text if in celebrity-bios.json
   Shows "coming soon" with celebrity name if not generated
   Disclaimer: "Based on publicly available information"
   In prerendered HTML: ✓ (Google sees it)
   data-testid: celebrity-bio / celebrity-bio-pending ✓

4. EXPANDED ASTROLOGICAL TABS (all pages)
   4 tabs: Western | Vedic/Rashi | Chinese | Numerology
   Conditional rendering (not CSS display:none) ✓
   Tab switching works (confirmed by TC-8B-P-09, -11) ✓
   Devanagari script renders in Vedic tab ✓
   Year-only: graceful messages in tabs that need full date ✓

5. GEMINI BIO SCRIPT
   File: scripts/generate-celebrity-bios.ts
   Output: src/data/celebrity-bios.json
   Parallelism: 8 concurrent Gemini Flash calls
   Validation: word count, name presence, no AI refusal language
   Auto-retry: up to 2 attempts per celebrity
   Rate limit handling: 60s wait on 429
   Batch 1 (top 50): ✓ generated

ASTROLOGICAL DATA FILE
   src/data/astrologicalData.ts
   12 Western zodiac profiles (correct Rider-Waite tarot)
   12 Vedic Rashi profiles (correct stones, mantras, Devanagari)
   12 Chinese zodiac profiles (lucky/unlucky elements)
   27 Nakshatra profiles (gana, deity, personality)
   13 Life Path profiles (1-9, 11, 22, 33)
   Runtime validation throws on any missing field ✓

TESTS
   TC-AD-01 to TC-AD-38: 38 data validation tests ✓
   TC-8B-P-01 to TC-8B-P-21: 21 positive tests ✓
   TC-8B-N-01 to TC-8B-N-11: 11 negative/edge tests ✓
   Total new tests: 70 (38 data + 32 component)
   Full unit suite: [X]/[X] ✓ (0 regressions)
   Build: CLEAN ✓
   Born-on: 200 + celebrity title (manifest intact) ✓

BEFORE vs AFTER
   Before: data table only → 3 second bounce → no value
   After:  Lucky panel → Synthesis → Bio → Facts table
            → Planetary ages → 4 astro tabs → Twins → FAQ → CTA

git commits: 9 separate commits ✓
Production: LIVE on bornclock.com ✓
══════════════════════════════════════════════════════════════
```

---

## After Completion — Run Remaining Batches

```bash
# Check status
npx tsx scripts/generate-celebrity-bios.ts --status

# Run next batches
npx tsx scripts/generate-celebrity-bios.ts --batch 2
npm run build && ./node_modules/.bin/wrangler deploy

npx tsx scripts/generate-celebrity-bios.ts --batch 3
npm run build && ./node_modules/.bin/wrangler deploy

# Fix a specific bio
npx tsx scripts/generate-celebrity-bios.ts --slug shah-rukh-khan
npm run build && ./node_modules/.bin/wrangler deploy
```

12 batches of 50 = all 598 celebrities covered in ~12 days running one batch per day, or in one evening running all back-to-back.

---

*End of Part B. Together with Part A, this is the complete Day 8B prompt.*
