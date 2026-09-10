import { test, expect, type Page } from '@playwright/test';

// ── Mock API payloads (route-mocked; no live backend/Gemini needed) ──────────
const KUNDALI = {
  lagna: { sign: 'Makara', signIndex: 10, degrees: 279.9 },
  planets: [
    { name: 'Sun', sign: 'Tula', signIndex: 7, house: 10, longitude: 199.4, retrograde: false },
    { name: 'Moon', sign: 'Kanya', signIndex: 6, house: 9, longitude: 156.2, retrograde: false },
    { name: 'Mars', sign: 'Kanya', signIndex: 6, house: 9, longitude: 170.1, retrograde: false },
    { name: 'Mercury', sign: 'Vrischika', signIndex: 8, house: 11, longitude: 220.3, retrograde: false },
    { name: 'Jupiter', sign: 'Vrisha', signIndex: 2, house: 5, longitude: 55.7, retrograde: true },
    { name: 'Venus', sign: 'Tula', signIndex: 7, house: 10, longitude: 205.9, retrograde: false },
    { name: 'Saturn', sign: 'Dhanu', signIndex: 9, house: 12, longitude: 255.2, retrograde: false },
    { name: 'Rahu', sign: 'Meena', signIndex: 12, house: 3, longitude: 340.0, retrograde: true },
    { name: 'Ketu', sign: 'Kanya', signIndex: 6, house: 9, longitude: 160.0, retrograde: true },
  ],
  nakshatra: { nakshatra: 'Uttara Phalguni', nakshatra_devanagari: 'उत्तराफाल्गुनी', pada: 2, confidence: 'high', is_boundary: false },
  rashi: 'Kanya', rashi_devanagari: 'कन्या',
  dasha: { mahadasha: 'Rahu', antardasha: 'Moon' },
  requires_birth_time: false,
};

// Real NEW (warmth pass) reading text (reference chart) — strength in words, no
// virupa numbers in the prose; shorter, warmer sentences. So the render check
// screenshots the genuine current output.
const READING_SECTIONS = {
  snapshot: `Your rising sign is Makara, giving you a steady and grounded approach to life. Its lord Saturn rests in your 12th house in Dhanu, which brings an inner pull toward reflection and quiet independence. Meanwhile, your Moon resides in Kanya in the bright star Uttara Phalguni, blending analytical care with warmth and natural integrity.`,
  career: `Your 10th house of career sits in sociable Tula, ruled by Venus in your 9th house in Kanya with moderately strong indicative strength. Sun and Mercury also occupy your 10th house, showing that professional success often grows through communication, advisory roles, and diplomatic tact. The Sun brings strong indicative presence to this house, helping you earn respect through thoughtful authority. With your current main period ruled by Rahu in your 2nd house, your work may increasingly center on resource management and purposeful speech.`,
  relationships: `Your 7th house of partnerships is gentle Karka, ruled by the Moon which sits peacefully in your 9th house in Kanya with strong indicative strength. Venus also rests in Kanya in your 9th house, bringing a helpful and devoted nature to personal bonds. In the Navamsa chart, Venus reaches Vrishabha, which supports deep emotional loyalty and long-term security. These placements foster partnerships that flourish through mutual growth and daily acts of kindness.`,
  health: `Your 6th house of daily routines and personal resilience is Mithuna, ruled by Mercury who sits in your 10th house in Tula. This pattern suggests your vitality thrives when your schedule is mentally engaging yet free from clutter. Your Lagna lord Saturn shows strong indicative strength, giving you reliable endurance over the long haul. Because Saturn rests in the 12th house, honoring quiet retreat and consistent sleep rhythms remains vital for your wellbeing.`,
  money: `Your 2nd house of resources is Kumbha, ruled by Saturn who sits in your 12th house in Dhanu. Your 11th house of gains is Vrischika, guided by a strong Mars placed in your 3rd house in Meena. This mix shows that financial growth tends to come through personal initiative and careful planning rather than quick luck. A retrograde Jupiter sits in your 5th house in Vrishabha with strong indicative strength, encouraging thoughtful and patient habits.`,
  family: `Your 4th house of home life is Mesha, ruled by Mars placed in your 3rd house in Meena. This placement often brings an active, self-directed spirit into your domestic sphere. Your 9th house of fatherhood and wisdom sits in analytical Kanya, with its lord Mercury in your 10th house in Tula. This harmony suggests your family values frequently inform your public path.`,
  rightNow: `You are currently navigating a Rahu main period paired with a Moon sub-period. Rahu sits in your 2nd house in Kumbha, drawing your attention toward family matters, financial habits, and authentic expression. The Moon brings strong indicative strength from your 9th house in Kanya, softening this phase with higher learning and emotional balance. Together, they tend to make this an introspective yet practical period.`,
  doshas: `Your chart is entirely free from Mangal Dosha, as Mars rests peacefully in your 3rd house in Meena. You also do not carry Kaal Sarp combinations, and Sade Sati is not currently active for you. There are no burdensome planetary afflictions in these areas, leaving your primary path clear and grounded. You can focus forward with calm confidence and steady personal effort.`,
  divisional: `Looking deeper into your subtle charts, your Navamsa rising sign settles in Meena with the Sun, while your Moon shifts to Makara. Venus gains graceful dignity in Vrishabha within this same D9 chart. In the Dasamsa chart of public life, the Sun sits in purposeful Mesha. According to one classical reading of the Shashtiamsa chart, your Moon rests in Vrischika, pointing to intuitive depth behind the scenes.`,
};

const FACTS = {
  rashi: 'Kanya', nakshatra: { name: 'Uttara Phalguni', pada: 2, lord: 'Sun' }, lagna: 'Makara',
  dasha: { maha: 'Rahu', antar: 'Moon' },
  placements: [
    { planet: 'Sun', sign: 'Tula', house: 10, retrograde: false },
    { planet: 'Moon', sign: 'Kanya', house: 9, retrograde: false },
    { planet: 'Saturn', sign: 'Dhanu', house: 12, retrograde: false },
  ],
  // Raw Shadbala numbers live in the advanced view (narrative uses words only).
  planets: [
    { planet: 'Sun', sign: 'Tula', house: 10, retrograde: false, shadbala: { total: 446, category: 'strong' } },
    { planet: 'Venus', sign: 'Kanya', house: 9, retrograde: false, shadbala: { total: 310, category: 'moderate' } },
    { planet: 'Saturn', sign: 'Dhanu', house: 12, retrograde: false, shadbala: { total: 344, category: 'strong' } },
  ],
  doshas: { mangal: { present: false, severityLabel: 'None' }, kaalSarp: { present: false, isPartial: false, type: null }, sadeSati: { active: false, phase: null } },
  divisional: { d9Moon: 'Makara', d10Sun: 'Mesha', d60Moon: 'Simha', d60Disclaimer: 'The Shashtiamsa (D60) is calculated using one of several classical traditions; treat it as one interpretation.' },
  warnings: [] as Array<{ code: string; message: string }>,
};

// Detected classical Yogas (Part G) — graded, mirroring the real engine output.
// Includes a "full" Raj Yoga (spoken confidently) and a "partial" Gaja Kesari
// (spoken as formed-but-not-fully-activated) so the graded display is visible.
const YOGAS = [
  { name: 'Raj Yoga', grade: 'full', summary: 'Yogakaraka Venus links a Kendra and a Trikona, giving authority and rise in status.', conditions: ['Venus rules both the 5th (Trikona) and 10th (Kendra) for Makara Lagna', 'Placed with strength in the 9th house'] },
  { name: 'Gaja Kesari Yoga', grade: 'partial', summary: 'Jupiter and the Moon relate by Kendra, associated with wisdom and good repute.', note: 'A common combination; formation alone is not a guarantee of full results.', conditions: ['Jupiter in a Kendra from the Moon', 'Neither is combust'] },
];

const readingPayload = (over: Partial<any> = {}) => ({
  facts: { ...FACTS, yogas: YOGAS, ...(over.facts || {}) },
  reading: over.reading === null ? null : READING_SECTIONS,
  degraded: over.degraded ?? false,
  warnings: over.warnings ?? [],
  source: 'local',
  _cache: 'miss',
  ...(over.top || {}),
});

async function fillFormAndGenerate(page: Page, dob = '1988-11-05', time = '12:30') {
  await page.goto('/kundali');
  await page.fill('[data-testid="kundali-dob"]', dob);
  await page.fill('[data-testid="kundali-time"]', time);
  await page.fill('[data-testid="kundali-city"]', 'Delhi');
  await page.locator('li button', { hasText: 'Delhi' }).first().click();
  await page.click('[data-testid="kundali-generate-btn"]');
}

// ── POSITIVE FLOW ────────────────────────────────────────────────────────────
test('positive: full reading renders all 5 sections with real text + advanced toggle', async ({ page }) => {
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload()) }));

  await fillFormAndGenerate(page);

  const reading = page.locator('[data-testid="vedic-reading"]');
  await expect(reading).toBeVisible();
  await expect(page.locator('[data-testid="reading-snapshot"]')).toContainText('Makara');
  for (const area of ['career', 'relationships', 'health', 'money', 'family']) {
    await expect(page.locator(`[data-testid="reading-area-${area}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-testid="reading-right-now"]')).toContainText('Rahu');
  await expect(page.locator('[data-testid="reading-doshas"]')).toContainText('Mangal Dosha');
  await expect(page.locator('[data-testid="reading-d60-disclaimer"]')).toContainText('one interpretation');
  // no stuck spinner, no empty
  await expect(page.locator('[data-testid="reading-loading"]')).toHaveCount(0);

  // Critique #1 — strength shown as WORDS in the narrative, no raw virupa numbers.
  const narrative = (await reading.textContent()) || '';
  expect(narrative).not.toMatch(/virupa/i);
  await expect(page.locator('[data-testid="reading-area-career"]')).toContainText('moderately strong');

  await page.screenshot({ path: 'e2e-reading/__screens__/01-positive-full-reading.png', fullPage: true });

  // advanced toggle reveals chart data — AND the raw Shadbala virupa numbers live here.
  await page.click('[data-testid="reading-advanced-toggle"]');
  await expect(page.locator('[data-testid="reading-advanced"]')).toBeVisible();
  await expect(page.locator('[data-testid="reading-shadbala"]')).toContainText('virupas');
  await expect(page.locator('[data-testid="reading-shadbala"]')).toContainText('446');
  await page.screenshot({ path: 'e2e-reading/__screens__/df-advanced-shadbala.png', fullPage: true });
  await expect(page.locator('[data-testid="reading-advanced"]')).toContainText('Sun');
  await page.screenshot({ path: 'e2e-reading/__screens__/02-advanced-view.png', fullPage: true });
});

// ── NEGATIVE FLOW: validation ────────────────────────────────────────────────
test('negative: missing fields shows a friendly validation message, button disabled', async ({ page }) => {
  await page.goto('/kundali');
  await expect(page.locator('[data-testid="kundali-validation-hint"]')).toBeVisible();
  await expect(page.locator('[data-testid="kundali-validation-hint"]')).toContainText('date of birth, birth time, and birth city');
  await expect(page.locator('[data-testid="kundali-generate-btn"]')).toBeDisabled();
  await page.screenshot({ path: 'e2e-reading/__screens__/03-validation-message.png', fullPage: true });
});

// ── NEGATIVE FLOW: backend/API failure ───────────────────────────────────────
test('negative: reading API failure shows a reasonable message, not a blank page or raw error', async ({ page }) => {
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'reading-failed' }) }));

  await fillFormAndGenerate(page);

  // chart still renders; reading shows a friendly note (not blank, not raw error)
  await expect(page.locator('[data-testid="kundali-lagna"]')).toBeVisible();
  await expect(page.locator('[data-testid="reading-failed"]')).toBeVisible();
  await expect(page.locator('[data-testid="reading-failed"]')).toContainText('try again in a little while');
  const body = await page.textContent('body');
  expect(body).not.toContain('reading-failed"'); // no raw JSON
  expect(body).not.toContain('500');
  await page.screenshot({ path: 'e2e-reading/__screens__/04-api-failure.png', fullPage: true });
});

// ── NEGATIVE FLOW: endpoint returns degraded (Gemini down, 200) ───────────────
test('negative: degraded reading (AI offline) shows facts + gentle notice, never blank', async ({ page }) => {
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload({ reading: null, degraded: true })) }));

  await fillFormAndGenerate(page);
  await expect(page.locator('[data-testid="reading-degraded-notice"]')).toBeVisible();
  await expect(page.locator('[data-testid="reading-snapshot"]')).toContainText('Kanya'); // deterministic facts, not blank
  await expect(page.locator('[data-testid="reading-advanced"]')).toBeVisible(); // facts shown automatically
  await page.screenshot({ path: 'e2e-reading/__screens__/05-degraded.png', fullPage: true });
});

// ── EDGE FLOW: polar-latitude warning visibly rendered ───────────────────────
test('edge: polar-latitude warning banner is visibly rendered in the DOM', async ({ page }) => {
  const polarWarn = [{ code: 'POLAR_LATITUDE', message: 'Birth latitude is above the polar circle threshold.' }];
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, warnings: polarWarn, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload({ warnings: polarWarn, facts: { ...FACTS, warnings: polarWarn } })) }));

  await fillFormAndGenerate(page, '1975-01-15', '03:00');
  const banner = page.locator('[data-testid="reading-polar-warning"]');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText(/polar|approximate/i);
  await page.screenshot({ path: 'e2e-reading/__screens__/06-polar-warning.png', fullPage: true });
});

// ── EDGE FLOW: multiple doshas present — calm tone ───────────────────────────
test('edge: multiple doshas present — doshas section reads calm, not alarming', async ({ page }) => {
  const doshaFacts = { ...FACTS, doshas: { mangal: { present: true, severityLabel: 'Moderate' }, kaalSarp: { present: true, isPartial: true, type: 'Takshak' }, sadeSati: { active: true, phase: 'Peak (on Moon sign)' } } };
  const doshaReading = { ...READING_SECTIONS, doshas: 'Your chart shows a few traditional patterns — Mangal, a partial Kaal Sarp, and an active Sade Sati phase. These are simply areas to be mindful of, never causes for alarm; gentle routines, patience, and traditional remedies like charity are the calm, constructive response.' };
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload({ facts: doshaFacts, top: { reading: doshaReading } })) }));

  await fillFormAndGenerate(page);
  const doshas = page.locator('[data-testid="reading-doshas"]');
  await expect(doshas).toBeVisible();
  await expect(doshas).toContainText(/mindful of/i);
  const text = (await doshas.textContent()) || '';
  expect(text).not.toMatch(/curse|doomed|danger|unlucky|suffer/i);
  await page.screenshot({ path: 'e2e-reading/__screens__/07-doshas-calm.png', fullPage: true });
});

// ── PART G: Yogas — narrative citation + graded advanced view ────────────────
test('yogas: narrative cites Yogas by grade + advanced view lists them graded', async ({ page }) => {
  // A reading that cites the full Raj Yoga confidently AND names the partial
  // Gaja Kesari as formed-but-not-fully-activated (the graded honesty).
  const yogaReading = {
    ...READING_SECTIONS,
    snapshot: `${READING_SECTIONS.snapshot} With a partial Gaja Kesari Yoga present, a reflective, good-humoured wisdom runs beneath your choices — a common combination, so held lightly rather than as a promise.`,
    career: `${READING_SECTIONS.career} Your chart also carries a strong Raj Yoga through Yogakaraka Venus, which classically supports steady rise in standing and responsibility.`,
  };
  await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
  await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload({ top: { reading: yogaReading } })) }));

  await fillFormAndGenerate(page);
  await expect(page.locator('[data-testid="vedic-reading"]')).toBeVisible();

  // Narrative cites Yogas by name, with graded language (not an absolute promise).
  await expect(page.locator('[data-testid="reading-area-career"]')).toContainText('Raj Yoga');
  await expect(page.locator('[data-testid="reading-snapshot"]')).toContainText('Gaja Kesari');
  await expect(page.locator('[data-testid="reading-snapshot"]')).toContainText(/partial|held lightly/i);
  await page.screenshot({ path: 'e2e-reading/__screens__/09-yogas-narrative.png', fullPage: true });

  // Advanced view lists each Yoga with its grade + the conditions checked.
  await page.click('[data-testid="reading-advanced-toggle"]');
  const yogaBox = page.locator('[data-testid="reading-yogas"]');
  await expect(yogaBox).toBeVisible();
  await expect(yogaBox).toContainText('Raj Yoga');
  await expect(yogaBox).toContainText('full');
  await expect(yogaBox).toContainText('Gaja Kesari Yoga');
  await expect(yogaBox).toContainText('partial');
  await expect(yogaBox).toContainText(/formation does not guarantee/i);
  await page.screenshot({ path: 'e2e-reading/__screens__/10-yogas-advanced.png', fullPage: true });
});

// ── EDGE FLOW: very old + very recent birth dates both render ─────────────────
for (const [label, dob] of [['old-1901', '1901-06-10'], ['recent-2015', '2015-12-25']] as const) {
  test(`edge: birth date ${label} renders correctly`, async ({ page }) => {
    await page.route('**/api/kundali*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...KUNDALI, _cache: 'miss' }) }));
    await page.route('**/api/vedic-reading*', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(readingPayload()) }));
    await fillFormAndGenerate(page, dob, '09:15');
    await expect(page.locator('[data-testid="vedic-reading"]')).toBeVisible();
    await expect(page.locator('[data-testid="reading-snapshot"]')).not.toBeEmpty();
    await page.screenshot({ path: `e2e-reading/__screens__/08-${label}.png`, fullPage: true });
  });
}
