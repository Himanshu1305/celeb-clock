/**
 * Classical references block — Growth P2 (P2-10, Rule 8).
 *
 * Lists the classical Vedic texts the interpretations draw on. Honesty rule:
 * texts are cited by name only (no chapter/verse) unless the specific citation
 * is verified — we do not invent chapter numbers. This is attribution, not a
 * claim that any single reading is quoted verbatim from a text.
 */
const TEXTS: Array<{ title: string; author?: string; note: string }> = [
  { title: 'Brihat Parashara Hora Shastra', author: 'attributed to Sage Parashara', note: 'the foundational classical text — houses, planetary lordships, dashas, yogas and doshas all follow its framework.' },
  { title: 'Brihat Jataka', author: 'Varahamihira', note: 'classical natal astrology — planetary dignities and basic predictive principles.' },
  { title: 'Saravali', author: 'Kalyana Varma', note: 'planetary combinations and their results, used for yoga and placement readings.' },
  { title: 'Phaladeepika', author: 'Mantreswara', note: 'results of planets, houses and periods — a standard reference for predictive timing.' },
];

export function ClassicalRefs({ compact = false }: { compact?: boolean }) {
  return (
    <details data-testid="classical-refs" className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
      <summary className="cursor-pointer font-medium text-foreground">Classical references</summary>
      <p className="mt-2 text-xs">
        The interpretations here follow the principles of the classical Vedic texts below. They are cited by name as the
        tradition they draw on — we do not attach a chapter or verse unless that specific citation has been verified
        (honesty standard).
      </p>
      <ul className="mt-2 space-y-1 text-xs list-disc pl-5">
        {TEXTS.map(t => (
          <li key={t.title}>
            <span className="font-medium text-foreground">{t.title}</span>{t.author ? ` (${t.author})` : ''}{compact ? '' : ` — ${t.note}`}
          </li>
        ))}
      </ul>
    </details>
  );
}
