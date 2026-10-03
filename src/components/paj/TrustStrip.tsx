/**
 * TrustStrip (Part AL, Step 9a) — one reusable, consistent trust line placed near the top of a
 * result/report page. The claim must be SPECIFIC and CHECKABLE against that page's real engine
 * behaviour — never a vague superiority boast. Self-contained inline styles reference the paj
 * CSS variables (resolve inside any `.paj` page), so it looks consistent sitewide.
 */
export function TrustStrip({ claim, testId = 'trust-strip' }: { claim: string; testId?: string }) {
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
      <span>{claim}</span>
    </div>
  );
}

export default TrustStrip;
