import { useTranslation } from 'react-i18next';
import '@/i18n';
import { ALL_LANGS, switchTarget } from '@/lib/lang/langs.js';
import { canonicalHref } from '@/lib/seo/canonicalPath.js';

const here = () => (typeof window !== 'undefined' ? window.location.pathname : '/');

/**
 * EN / हि switch the interface language (i18n), as before. B18: a compact "भाषा ▾"
 * dropdown lists every language — English, Hindi and the eight regional languages — and
 * links to the SAME page in that language when it exists (src/lib/lang/langs.js
 * switchTarget), else to that language's landing page. The target is re-read on click so
 * it always follows the current route.
 */
export function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('hi') ? 'hi' : 'en';
  const set = (lng: 'en' | 'hi') => { i18n.changeLanguage(lng); };

  const btn = (active: boolean) =>
    // Rendered only inside AuthNav's navy site-header, so the inactive state uses a
    // light ink (white/75) that meets WCAG AA on navy — muted-foreground is dark and
    // was invisible there (RC2 a11y).
    `px-2 py-1 text-xs font-semibold rounded ${active ? 'bg-primary text-primary-foreground' : 'text-white/75 hover:text-white'}`;

  return (
    <div data-testid="language-toggle" className="relative inline-flex items-center gap-1 border border-border rounded-lg p-0.5" role="group" aria-label="Language">
      <button type="button" onClick={() => set('en')} className={btn(current === 'en')} aria-pressed={current === 'en'}>EN</button>
      <button type="button" onClick={() => set('hi')} className={btn(current === 'hi')} aria-pressed={current === 'hi'}>हि</button>
      <details data-testid="language-menu" className="relative">
        <summary className="list-none cursor-pointer px-2 py-1 text-xs font-semibold rounded text-white/75 hover:text-white" aria-label="More languages">भाषा ▾</summary>
        <ul className="absolute right-0 z-50 mt-1 w-40 rounded-lg border border-border bg-white p-1 shadow-lg">
          {ALL_LANGS.map(l => (
            <li key={l.code}>
              <a
                href={canonicalHref(switchTarget(here(), l.code))}
                lang={l.code}
                hrefLang={l.code}
                data-lang={l.code}
                onClick={e => { e.preventDefault(); window.location.assign(canonicalHref(switchTarget(here(), l.code))); }}
                className="block rounded px-2 py-1.5 text-sm text-brand-ink hover:bg-brand-gold/10"
              >
                {l.native}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default LanguageToggle;
