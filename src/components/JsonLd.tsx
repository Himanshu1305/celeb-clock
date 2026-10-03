/**
 * JsonLd (Part AM hardening) — renders a JSON-LD <script> IN THE BODY, via React, rather than
 * through react-helmet-async's <head> injection.
 *
 * Why: the prerender (scripts/prerender.mjs) captures document.documentElement.outerHTML BEFORE
 * react-helmet-async flushes its head tags (a known rAF-timing race — it already manually
 * re-injects title/description/canonical/BreadcrumbList for that reason). Helmet-injected
 * WebApplication / FAQPage / WebPage JSON-LD therefore did NOT reliably land in the prerendered
 * HTML (verified: present on /numerology, missing on /compatibility, /rashi-ratna, etc.).
 *
 * Rendering the script in the body sidesteps the race entirely: React puts it in the DOM, so
 * outerHTML always captures it, and JSON-LD is valid anywhere in the document per schema.org/Google.
 */
export function JsonLd({ data, id }: { data: unknown; id?: string }) {
  return (
    <script
      type="application/ld+json"
      data-testid={id ? `jsonld-${id}` : 'jsonld'}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default JsonLd;
