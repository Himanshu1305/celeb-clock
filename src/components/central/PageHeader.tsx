import type { ReactNode } from 'react';
import { TrustStrip } from '@/components/paj/TrustStrip';

/**
 * The header block that every non-hub layout owns: eyebrow · H1 · lead, inside a
 * `.section .section-head`, optionally followed by the trust strip. Exactly the
 * structure the approved redesigned pages use (e.g. KundaliPage), so pages look
 * identical after moving onto the central layouts.
 */
export function PageHeader({
  eyebrow,
  h1,
  lead,
  trust,
  trustHref,
  white = false,
}: {
  eyebrow?: ReactNode;
  h1: ReactNode;
  lead?: ReactNode;
  trust?: string;
  trustHref?: string;
  white?: boolean;
}) {
  return (
    <section className={white ? 'section white' : 'section'}>
      <div className="section-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{h1}</h1>
        </div>
        {lead && <p>{lead}</p>}
      </div>
      {trust && <TrustStrip claim={trust} href={trustHref} />}
    </section>
  );
}
