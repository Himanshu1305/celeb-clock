import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Check } from 'lucide-react';

// Native share sheet (navigator.share — the OS sheet includes WhatsApp on mobile)
// with a copy-link fallback on desktop / unsupported browsers.
interface Props {
  url: string;
  title: string;
  text: string;               // WhatsApp-friendly message
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  onShared?: (method: 'native' | 'copy') => void;
}

export function NativeShareButton({ url, title, text, label = 'Share', variant = 'outline', className, onShared }: Props) {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title, text, url });
        onShared?.('native');
        return;
      } catch {
        // user cancelled or share failed — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      onShared?.('copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — last resort: WhatsApp web deep link
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
      onShared?.('copy');
    }
  };

  return (
    <Button onClick={handle} variant={variant} className={className}>
      {copied ? <><Check className="w-4 h-4 mr-1.5" /> Link copied</> : <><Share2 className="w-4 h-4 mr-1.5" /> {label}</>}
    </Button>
  );
}
