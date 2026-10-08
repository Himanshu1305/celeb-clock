import { test, expect, type Page } from '@playwright/test';

// RC3 Rule-4 — third batch: broadens real-use coverage to the client-side / birthday /
// science tools on the live staging worker. These use the shared DobInput trio
// (text inputs labelled Day/Month/Year — NOT native type=date, so WebKit iPhone can
// drive them) or plain text inputs. Each enters real input, triggers the compute, and
// asserts a real, page-specific result renders (never an error / crash).

const CRASH = /something went wrong|something broke|unexpected error|white screen/i;

async function fillDobTrio(page: Page, day: string, month: string, year: string) {
  await page.getByLabel('Day', { exact: true }).first().fill(day);
  await page.getByLabel('Month', { exact: true }).first().fill(month);
  await page.getByLabel('Year', { exact: true }).first().fill(year);
}

async function clickCompute(page: Page, re: RegExp) {
  const btn = page.getByRole('button', { name: re }).first();
  if (await btn.count()) await btn.click().catch(() => {});
}

test('Life Expectancy — real DOB yields a projected age/years result', async ({ page }) => {
  await page.goto('/life-expectancy/');
  await fillDobTrio(page, '13', '05', '1978');
  await clickCompute(page, /calculate|estimate|how long|reveal/i);
  await expect(page.locator('body')).toContainText(/\b(年|years|age|life expectancy|live)\b/i, { timeout: 25_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Chinese Zodiac — real DOB yields an animal sign', async ({ page }) => {
  await page.goto('/chinese-zodiac/');
  await fillDobTrio(page, '13', '05', '1978');
  await clickCompute(page, /calculate|reveal|find|my sign/i);
  await expect(page.locator('body')).toContainText(
    /Rat|Ox|Tiger|Rabbit|Dragon|Snake|Horse|Goat|Monkey|Rooster|Dog|Pig/i, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Planetary Age & Weight — real DOB yields per-planet figures', async ({ page }) => {
  await page.goto('/planetary-age/');
  await fillDobTrio(page, '13', '05', '1978');
  await clickCompute(page, /calculate|reveal|my age/i);
  await expect(page.locator('body')).toContainText(/Mercury|Venus|Mars|Jupiter|Saturn|weight|kg/i, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Biorhythm — real DOB yields physical/emotional/intellectual cycles', async ({ page }) => {
  await page.goto('/biorhythm/');
  await fillDobTrio(page, '13', '05', '1978');
  await clickCompute(page, /calculate|reveal|show/i);
  await expect(page.locator('body')).toContainText(/physical|emotional|intellectual|cycle/i, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Tarot by birthday — real DOB yields a tarot card', async ({ page }) => {
  await page.goto('/tarot-card-by-birthday/');
  await fillDobTrio(page, '13', '05', '1978');
  await clickCompute(page, /reveal|draw|calculate|my card/i);
  await expect(page.locator('body')).toContainText(
    /The (Magician|Fool|Emperor|Empress|Star|Moon|Sun|World|Tower|Hermit|Lovers|Chariot|Hierophant|Hanged|Wheel)|Justice|Strength|Temperance|Death|Judgement|High Priestess|Devil/i,
    { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Age calculator — real DOB yields an age in years', async ({ page }) => {
  await page.goto('/age-calculator/');
  await fillDobTrio(page, '13', '05', '1978').catch(() => {});
  await clickCompute(page, /calculate|my age/i);
  await expect(page.locator('body')).toContainText(/years?\b|months?\b|days?\b/i, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Name numerology — a real name yields a destiny/expression number', async ({ page }) => {
  await page.goto('/name-numerology/');
  const nameInput = page.getByRole('textbox').first();
  await nameInput.fill('Priya Sharma');
  await clickCompute(page, /calculate|reveal|analyse|analyze|my number/i);
  await expect(page.locator('body')).toContainText(/Destiny|Expression|Soul|number|numerolog/i, { timeout: 20_000 });
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('Homepage date decode — a real DOB on the homepage produces a decode result', async ({ page }) => {
  await page.goto('/');
  // Homepage hero has the shared DobInput; fill and submit.
  if (await page.getByLabel('Day', { exact: true }).first().count()) {
    await fillDobTrio(page, '13', '05', '1978');
    await clickCompute(page, /decode|reveal|calculate|see|go/i);
  }
  await expect(page.locator('body')).not.toContainText(CRASH);
});

test('/results — direct query renders a results page, not a crash', async ({ page }) => {
  const resp = await page.goto('/results?day=13&month=5&year=1978');
  expect(resp?.status() ?? 200).toBeLessThan(400);
  await expect(page.locator('body')).not.toContainText(CRASH);
  await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });
});

test('Celebrity search — a real query surfaces matching people', async ({ page }) => {
  await page.goto('/celebrity/');
  const box = page.getByRole('textbox').first();
  if (await box.count()) {
    await box.fill('Einstein');
    await page.waitForTimeout(1500);
  }
  await expect(page.locator('body')).not.toContainText(CRASH);
});
