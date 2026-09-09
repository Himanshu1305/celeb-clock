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

const READING_SECTIONS = {
  snapshot: 'With your steady Capricorn rising, practical Virgo Moon, and the bright energy of Uttara Phalguni, you carry a natural blend of grounded determination and quiet generosity.',
  career: 'Your professional life is shaped by a drive to bring balance and thoughtful communication into your work. This period is traditionally associated with adaptability and steady, methodical progress.',
  relationships: 'In partnership, you tend to show care through practical devotion and attentive listening. A calm, supportive environment helps your connections deepen over time.',
  health: 'Your wellbeing tends to respond best to steady daily rhythms, wholesome nourishment, and gentle, unhurried routines. Making space for rest can help restore your vitality.',
  money: 'Your natural inclination often leans toward prudence and long-term security. A relaxed, mindful relationship with resources tends to keep you grounded.',
  family: 'Home and family life often serve as a space for quiet reflection and mutual support. Creating a peaceful, organised sanctuary can give you emotional grounding.',
  rightNow: 'You are currently moving through a Rahu period with a Moon sub-period, an interval traditionally associated with inner reflection and shifting emotional landscapes.',
  doshas: 'Your chart is reassuringly free from major intense patterns such as Mangal Dosha or Kaal Sarp. Traditional astrology views this as a calm foundation — simply mindful living is the gentle suggestion.',
  divisional: 'A look into your deeper layers suggests inner resilience that strengthens with maturity. In one classical reading some traditions suggest deeper transformations over time — one of several perspectives.',
};

const FACTS = {
  rashi: 'Kanya', nakshatra: { name: 'Uttara Phalguni', pada: 2, lord: 'Sun' }, lagna: 'Makara',
  dasha: { maha: 'Rahu', antar: 'Moon' },
  placements: [
    { planet: 'Sun', sign: 'Tula', house: 10, retrograde: false },
    { planet: 'Moon', sign: 'Kanya', house: 9, retrograde: false },
    { planet: 'Saturn', sign: 'Dhanu', house: 12, retrograde: false },
  ],
  doshas: { mangal: { present: false, severityLabel: 'None' }, kaalSarp: { present: false, isPartial: false, type: null }, sadeSati: { active: false, phase: null } },
  divisional: { d9Moon: 'Makara', d10Sun: 'Mesha', d60Moon: 'Simha', d60Disclaimer: 'The Shashtiamsa (D60) is calculated using one of several classical traditions; treat it as one interpretation.' },
  warnings: [] as Array<{ code: string; message: string }>,
};

const readingPayload = (over: Partial<any> = {}) => ({
  facts: { ...FACTS, ...(over.facts || {}) },
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
  await expect(page.locator('[data-testid="reading-snapshot"]')).toContainText('grounded determination');
  for (const area of ['career', 'relationships', 'health', 'money', 'family']) {
    await expect(page.locator(`[data-testid="reading-area-${area}"]`)).toBeVisible();
  }
  await expect(page.locator('[data-testid="reading-right-now"]')).toContainText('Rahu period');
  await expect(page.locator('[data-testid="reading-doshas"]')).toContainText('calm foundation');
  await expect(page.locator('[data-testid="reading-d60-disclaimer"]')).toContainText('one interpretation');
  // no stuck spinner, no empty
  await expect(page.locator('[data-testid="reading-loading"]')).toHaveCount(0);

  await page.screenshot({ path: 'e2e-reading/__screens__/01-positive-full-reading.png', fullPage: true });

  // advanced toggle reveals chart data
  await page.click('[data-testid="reading-advanced-toggle"]');
  await expect(page.locator('[data-testid="reading-advanced"]')).toBeVisible();
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
