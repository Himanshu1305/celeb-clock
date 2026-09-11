import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { buildChatSystemPrompt } from '../chatGuardrails';
import { verifyYogaClaims } from '../readingSpecificity';
import { buildChatReply } from '../../../../api/vedic-chat';

const NOW = new Date(Date.UTC(2026, 8, 11));
async function refFacts() {
  const c = await calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 }, { includeShadbala: true, refDate: NOW });
  return extractReadingFacts(c, NOW);
}

describe('verifyYogaClaims — zero-tolerance Yoga guard (Part J)', () => {
  it('flags a fabricated Yoga, passes a real one, passes a correct negation', () => {
    const present = ['Raj Yoga', 'Dhana Yoga', 'Budha-Aditya Yoga'];
    // asserting an ABSENT Yoga → wrong
    expect(verifyYogaClaims('You have a powerful Gaja Kesari Yoga.', present).wrong.map(w => w.token)).toContain('Gaja Kesari');
    // asserting a REAL Yoga → ok
    expect(verifyYogaClaims('Your strong Raj Yoga supports your standing.', present).wrong).toHaveLength(0);
    // NEGATING an absent Yoga → ok
    expect(verifyYogaClaims('You do not have Gaja Kesari Yoga in your chart.', present).wrong).toHaveLength(0);
  });

  it('Yogakaraka mention passes when the chart has a Raj Yoga formed by one', () => {
    expect(verifyYogaClaims('Your Yogakaraka Venus is powerful.', ['Raj Yoga'], true).wrong).toHaveLength(0);
  });
});

describe('chat system prompt now carries detected Yogas + birth-star meaning (Part J)', () => {
  it('lists the real Yogas with grades and the Nakshatra meaning, and rule 9', async () => {
    const p = buildChatSystemPrompt(await refFacts());
    expect(p).toMatch(/DETECTED YOGAS/);
    expect(p).toMatch(/Raj Yoga \[/);
    expect(p).toMatch(/Birth star meaning:/);
    expect(p).toMatch(/9\. YOGAS & BIRTH STAR/);
  });
});

describe('buildChatReply — Yoga accuracy guard in the retry loop', () => {
  it('passes a reply that cites only real Yogas and marks it yogaChecked', async () => {
    const f = await refFacts();
    const gen = async () => 'Your strong Raj Yoga, formed by your Yogakaraka Venus, supports your standing.';
    const out = await buildChatReply(f, [], 'what yogas do i have', gen);
    expect(out.yogaChecked).toBe(true);
    expect(out.sanitized).toBeFalsy();
    expect(out.reply).toMatch(/Raj Yoga/);
  });

  it('retries a fabricated Yoga, then blocks it (never reaches the user)', async () => {
    const f = await refFacts();
    let calls = 0;
    const gen = async () => { calls++; return 'Yes, you have a strong Gaja Kesari Yoga guaranteeing great wisdom.'; };
    const out = await buildChatReply(f, [], 'do i have gaja kesari', gen);
    expect(calls).toBe(3); // 3 attempts before giving up on the model
    expect(out.sanitized).toBe(true); // fabricated Yoga blocked
    expect(out.reply).not.toMatch(/Gaja Kesari/);
    expect((out.redFlags || []).some((r: string) => r.includes('bad-yoga') || r.includes('Gaja'))).toBe(true);
  });

  it('recovers a good reply on retry when the first attempt fabricated a Yoga', async () => {
    const f = await refFacts();
    let calls = 0;
    const gen = async () => {
      calls++;
      return calls === 1
        ? 'You have a Gaja Kesari Yoga.'                                  // fabricated (not in chart)
        : 'You do not have Gaja Kesari Yoga, but you do have a strong Raj Yoga.'; // corrected + honest
    };
    const out = await buildChatReply(f, [], 'do i have gaja kesari', gen);
    expect(calls).toBe(2);
    expect(out.sanitized).toBeFalsy();
    expect(out.reply).toMatch(/do not have Gaja Kesari/i);
  });
});
