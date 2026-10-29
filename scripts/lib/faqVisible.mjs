// Batch 10 — FAQ visibility rule (validate-dist V10 + unit tests).
//
// Google's FAQ structured-data guidelines require every Question/Answer in FAQPage
// JSON-LD to be visible to the user on the page. This helper takes a prerendered HTML
// document and reports FAQPage questions whose text does not appear in the page body
// outside <script>/<style>, and answers that are not in the HTML at all (collapsed
// accordion answers are fine: the shared accordion keeps them in the DOM, hidden).

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '\u2014', ndash: '\u2013', rsquo: '\u2019', lsquo: '\u2018', divide: '\u00F7', hellip: '\u2026' };

export function decodeEntities(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z#0-9]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));
}

/** Lower-case, unify quotes/dashes, strip markdown emphasis, collapse whitespace. */
export function normalizeText(s) {
  return decodeEntities(String(s))
    .replace(/<[^>]+>/g, ' ')
    .replace(/[‘’‛′]/g, "'")
    .replace(/[“”″]/g, '"')
    .replace(/[–—−]/g, '-')
    .replace(/\*\*|__/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** All FAQPage blocks' Q&As from the document's JSON-LD (top level, arrays and @graph). */
export function faqEntries(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  const visit = (node) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    const types = [].concat(node['@type'] || []);
    if (types.includes('FAQPage')) {
      for (const q of [].concat(node.mainEntity || [])) {
        if (!q || typeof q !== 'object') continue;
        const a = [].concat(q.acceptedAnswer || [])[0];
        out.push({ question: String(q.name || ''), answer: String((a && a.text) || '') });
      }
    }
    if (node['@graph']) visit(node['@graph']);
  };
  while ((m = re.exec(html))) {
    try { visit(JSON.parse(m[1])); } catch { /* malformed block: other checks report it */ }
  }
  return out;
}

/** Body text with scripts, styles, noscript and tags removed. `hidden` content is kept:
 *  collapsed accordion answers are in the HTML and become visible on tap. */
export function bodyText(html) {
  const b = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  const body = (b ? b[1] : html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return normalizeText(body);
}

const ANSWER_PREFIX = 80;

/** Problems for one HTML document: [{ kind: 'question'|'answer', text }]. */
export function faqVisibilityProblems(html) {
  const entries = faqEntries(html);
  if (!entries.length) return [];
  const text = bodyText(html);
  const problems = [];
  for (const { question, answer } of entries) {
    const q = normalizeText(question);
    if (q && !text.includes(q)) problems.push({ kind: 'question', text: question });
    // Answers: the opening of the answer must be in the HTML (hidden is fine).
    const a = normalizeText(answer).slice(0, ANSWER_PREFIX);
    if (a && !text.includes(a)) problems.push({ kind: 'answer', text: `${question} → ${answer.slice(0, 60)}` });
  }
  return problems;
}
