import { describe, it, expect } from 'vitest';
import { calculateBirthChart } from '../calculateBirthChart';
import { extractReadingFacts } from '../readingPrompts';
import { gemstoneChatContext } from '../gemstones';
import { buildChatSystemPrompt } from '../chatGuardrails';

const NOW = new Date(Date.UTC(2026, 8, 11));
const refChart = () => calculateBirthChart({ year: 1988, month: 11, day: 5, hour: 12, minute: 30, latitude: 28.6, longitude: 77.2, timezoneOffset: 5.5 }, { includeShadbala: true, refDate: NOW });

describe('Item 3 — chat gemstone context is Lagna-based (reuses the page result)', () => {
  it('provides the same Lagna-based primary stone as the dedicated page, plus the Rashi alternative', async () => {
    const c = await refChart(); // Makara Lagna (Venus Yogakaraka), Kanya Moon (Mercury)
    const g = gemstoneChatContext(c);
    // Lagna-based = the rigorous, page-matching result
    expect(g.lagnaBased).toMatch(/LAGNA-BASED/);
    expect(g.lagnaBased).toMatch(/Diamond/);        // Venus stone
    expect(g.lagnaBased).toMatch(/Venus/);
    expect(g.lagnaBased).toMatch(/Yogakaraka/);
    // Rashi-only alternative = the shortcut, clearly labelled less precise
    expect(g.rashiBased).toMatch(/RASHI-ONLY/);
    expect(g.rashiBased).toMatch(/Kanya/);          // Moon sign
    expect(g.rashiBased).toMatch(/Emerald/);        // Mercury (Kanya lord) stone
    expect(g.rashiBased).toMatch(/less precise|less tailored/i);
  });

  it('the chat prompt carries the gemstone block + Rule 10 (default Lagna, explain Rashi if asked)', async () => {
    const facts = extractReadingFacts(await refChart(), NOW);
    const p = buildChatSystemPrompt(facts, gemstoneChatContext(await refChart()));
    expect(p).toMatch(/GEMSTONE \(computed for THIS chart/);
    expect(p).toMatch(/10\. GEMSTONES/);
    expect(p).toMatch(/DEFAULT to the LAGNA-BASED/);
    expect(p).toMatch(/If the user specifically asks about a Moon-sign/);
    // no gemstone block when none is passed (back-compat)
    expect(buildChatSystemPrompt(facts)).not.toMatch(/GEMSTONE \(computed for THIS chart/);
  });
});
