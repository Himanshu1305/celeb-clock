import { useState } from 'react';
import { MessageCircle, Twitter, Facebook, Link2, Check, Share2 } from 'lucide-react';

// Reusable share bar for content pages (born-on, month hub, zodiac, fitness, blog).
// WhatsApp / X / Facebook are real anchors (crawlable + testable hrefs), Copy uses
// the clipboard, and native uses the OS share sheet on mobile (falls back to copy).
// Share links always point at the canonical production URL so the batch-2 OG card
// renders in the preview regardless of the runtime origin.
interface Props {
  /** Route path (e.g. "/born-on/january-1") — normalised to the canonical https URL. */
  path: string;
  /** OS share-sheet title. */
  title: string;
  /** Share message, e.g. "People born on January 1 are… — see who shares this birthday". */
  text: string;
  className?: string;
}

function canonical(path: string): string {
  const clean = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  const withSlash = clean === '/' ? '/' : `${clean}/`;
  return `https://bornclock.com${withSlash}`;
}

export function SharePageBar({ path, title, text, className }: Props) {
  const [copied, setCopied] = useState(false);
  const url = canonical(path);
  const encMsg = encodeURIComponent(`${text} ${url}`);
  const encUrl = encodeURIComponent(url);
  const encText = encodeURIComponent(text);

  const whatsapp = `https://wa.me/?text=${encMsg}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encText}&url=${encUrl}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(whatsapp, '_blank', 'noopener');
    }
  };

  const nativeShare = async () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try { await nav.share({ title, text, url }); return; } catch { /* cancelled */ }
    }
    copy();
  };

  const btn = 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors';

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">Share</span>
      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on WhatsApp">
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </a>
      <a href={twitter} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on X">
        <Twitter className="w-4 h-4" /> X
      </a>
      <a href={facebook} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Share on Facebook">
        <Facebook className="w-4 h-4" /> Facebook
      </a>
      <button type="button" onClick={copy} className={btn} aria-label="Copy link">
        {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Link2 className="w-4 h-4" /> Copy link</>}
      </button>
      <button type="button" onClick={nativeShare} className={`${btn} sm:hidden`} aria-label="Share">
        <Share2 className="w-4 h-4" /> Share
      </button>
    </div>
  );
}
