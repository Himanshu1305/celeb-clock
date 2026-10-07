import { useTranslation } from 'react-i18next';
import '@/i18n';

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
    <div data-testid="language-toggle" className="inline-flex items-center gap-1 border border-border rounded-lg p-0.5" role="group" aria-label="Language">
      <button type="button" onClick={() => set('en')} className={btn(current === 'en')} aria-pressed={current === 'en'}>EN</button>
      <button type="button" onClick={() => set('hi')} className={btn(current === 'hi')} aria-pressed={current === 'hi'}>हि</button>
    </div>
  );
}

export default LanguageToggle;
