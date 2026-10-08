/**
 * TrustStrip (Part AL, Step 9a) — one reusable, consistent trust line placed near the top of a
 * result/report page. The claim must be SPECIFIC and CHECKABLE against that page's real engine
 * behaviour — never a vague superiority boast, and written in plain, impact-first language: no
 * unexplained jargon, and every number says what it measures. Self-contained inline styles
 * reference the paj CSS variables (resolve inside any `.paj` page), so it looks consistent sitewide.
 *
 * `href` (RC3 Item 4) adds an optional "How we test" link to the relevant section of
 * /how-it-works, where the comparison service (ProKerala) and the full figures are named.
 */
export function TrustStrip({
  claim,
  href,
  linkLabel = 'How we test',
  testId = 'trust-strip',
}: {
  claim: string;
  href?: string;
  linkLabel?: string;
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      role="note"
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        borderLeft: '3px solid var(--accent)', background: 'var(--paper)',
        padding: '10px 14px', margin: '0 0 16px', fontSize: 13, lineHeight: 1.5,
        color: 'var(--ink)',
      }}
    >
      <span aria-hidden="true" style={{ color: 'var(--accent-text)', fontWeight: 700, flex: 'none' }}>✓</span>
      <span>
        {claim}
        {href && (
          <>
            {' '}
            <a
              href={href}
              data-testid={`${testId}-link`}
              style={{ color: 'var(--accent-text)', fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              {linkLabel} →
            </a>
          </>
        )}
      </span>
    </div>
  );
}

export default TrustStrip;
