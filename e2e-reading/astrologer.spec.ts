import { test, expect, type Page } from '@playwright/test';

const SAVED = { dob: '1988-11-05', time: '12:30', city: { name: 'Delhi', lat: 28.6139, lon: 77.209, tz: 5.5 }, savedAt: '2026-01-01T00:00:00Z' };

async function seedProfile(page: Page) {
  await page.addInitScript(p => localStorage.setItem('bornclock-birth-profile', JSON.stringify(p)), SAVED);
}

// Mock the chat endpoint: first answer + a contextual follow-up (proving history
// is carried), keyed by a per-page call counter.
async function mockChat(page: Page) {
  await page.addInitScript(() => (window as any).__chatCalls = 0);
  await page.route('**/api/vedic-chat', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    const isFollowUp = Array.isArray(body.messages) && body.messages.length > 0;
    const reply = isFollowUp
      ? 'Building on your career question: in relationships, your Moon in Kanya in the 9th house suggests you value depth and shared meaning — this Rahu-Moon period is traditionally associated with reflecting on what you truly need.'
      : 'With your Sun and Mercury in your 10th house of career, you have strong communication instincts. This Rahu main period is traditionally associated with reassessing your direction — a good time to take steady, thoughtful steps.';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply, crisis: false, degraded: false, sanitized: false, grounding: ['Rashi:Kanya', 'Dasha:Rahu/Moon'] }) });
  });
}

test('conversation flow: grounded answer + contextual follow-up', async ({ page }) => {
  await seedProfile(page);
  await mockChat(page);
  await page.goto('/astrologer');
  await expect(page.locator('[data-testid="astrologer-chat"]')).toBeVisible();
  await expect(page.locator('[data-testid="astrologer-remaining"]')).toContainText('3 questions left');

  await page.fill('[data-testid="astrologer-input"]', 'what does my career look like this year?');
  await page.click('[data-testid="astrologer-send"]');
  await expect(page.locator('[data-testid="astrologer-msg-bot"]').first()).toContainText('10th house of career');
  await expect(page.locator('[data-testid="astrologer-remaining"]')).toContainText('2 questions left'); // counted
  await page.screenshot({ path: 'e2e-reading/__screens__/pf-01-answer.png', fullPage: true });

  await page.fill('[data-testid="astrologer-input"]', 'and what about my relationships?');
  await page.click('[data-testid="astrologer-send"]');
  await expect(page.locator('[data-testid="astrologer-msg-bot"]').nth(1)).toContainText('Building on your career question');
  await page.screenshot({ path: 'e2e-reading/__screens__/pf-02-followup.png', fullPage: true });
});

test('crisis rendering: a crisis reply shows the support message, not astrology', async ({ page }) => {
  await seedProfile(page);
  await page.route('**/api/vedic-chat', route => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ crisis: true, reply: "I'm really glad you told me, and I want to gently set the astrology aside for a moment. If you're in immediate danger, please contact your local emergency services. You can talk to someone free, any time — India iCall: 9152987821; US call or text 988; find a helpline at findahelpline.com. You don't have to carry this alone." }) }));
  await page.goto('/astrologer');
  await page.fill('[data-testid="astrologer-input"]', 'I feel hopeless and do not want to be here');
  await page.click('[data-testid="astrologer-send"]');
  const bot = page.locator('[data-testid="astrologer-msg-bot"]').first();
  await expect(bot).toContainText('988');
  await expect(bot).toContainText('findahelpline.com');
  await expect(bot).not.toContainText(/saturn|rahu|dasha/i);
  await page.screenshot({ path: 'e2e-reading/__screens__/pf-03-crisis.png', fullPage: true });
});

test('rate-limit flow: at the daily cap, a clear message shows (no crash)', async ({ page }) => {
  await seedProfile(page);
  // Seed today's usage at the free cap (3).
  await page.addInitScript(() => {
    const n = new Date();
    const day = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
    localStorage.setItem('bornclock-astrologer-usage', JSON.stringify({ day, count: 3 }));
  });
  await page.goto('/astrologer');
  await expect(page.locator('[data-testid="astrologer-remaining"]')).toContainText('0 questions left');
  await page.fill('[data-testid="astrologer-input"]', 'can I ask one more?');
  await page.click('[data-testid="astrologer-send"]');
  await expect(page.locator('[data-testid="astrologer-ratelimit"]')).toContainText('free questions for today');
  await page.screenshot({ path: 'e2e-reading/__screens__/pf-04-ratelimit.png', fullPage: true });
});

test('no-profile flow: user without saved details is prompted to add them', async ({ page }) => {
  await page.goto('/astrologer');
  await expect(page.locator('[data-testid="astrologer-no-profile"]')).toBeVisible();
  await expect(page.locator('[data-testid="astrologer-no-profile"]')).toContainText('add your birth details');
  await expect(page.locator('[data-testid="astrologer-add-details"]')).toHaveAttribute('href', '/kundali');
  await expect(page.locator('[data-testid="astrologer-chat"]')).toHaveCount(0);
  await page.screenshot({ path: 'e2e-reading/__screens__/pf-05-no-profile.png', fullPage: true });
});
