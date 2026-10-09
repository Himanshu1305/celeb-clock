/**
 * AutoTranslatedNotice — P4-LANG.
 * Honest, subtle disclosure that a page's translation is machine-assisted and
 * pending human review (Rule 8 + the P4 rule: machine-assisted translation is
 * allowed but must be flagged for the person's human review before launch).
 * Keep it unobtrusive — a one-line note, not an alarming banner.
 */
export function AutoTranslatedNotice({ lang = 'hi' }: { lang?: 'hi' | 'te' }) {
  const text =
    lang === 'hi'
      ? 'यह अनुवाद मशीन-सहायता से किया गया है और मानव समीक्षा लंबित है।'
      : 'ఈ అనువాదం యంత్ర-సహాయంతో చేయబడింది, మానవ సమీక్ష పెండింగ్‌లో ఉంది.';
  return (
    <p
      data-testid="auto-translated-notice"
      data-lang={lang}
      className="text-[11px] text-muted-foreground/80 italic mb-4"
    >
      🤖 {text} <span className="not-italic">(machine-assisted translation — pending human review)</span>
    </p>
  );
}
