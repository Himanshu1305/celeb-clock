import { useState } from 'react';

/**
 * ShareMyProfileButton (Task 19) — renders the birthday profile to a canvas
 * image and shares it via the Web Share API (with a file), falling back to a
 * PNG download when file-sharing isn't available. Fully guarded for jsdom/SSR.
 */
export function ShareMyProfileButton({
  name,
  subtitle,
  url = 'https://bornclock.com/birthday-report',
  className = '',
}: {
  name: string;
  subtitle?: string;
  url?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const buildImage = (): Promise<Blob | null> =>
    new Promise((resolve) => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080; canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        const g = ctx.createLinearGradient(0, 0, 1080, 1080);
        g.addColorStop(0, '#4f46e5'); g.addColorStop(1, '#db2777');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1080);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
        ctx.font = 'bold 56px sans-serif';
        ctx.fillText('My Birthday Profile', 540, 400);
        ctx.font = 'bold 80px sans-serif';
        ctx.fillText((name || 'You').slice(0, 22), 540, 520);
        if (subtitle) { ctx.font = '40px sans-serif'; ctx.fillText(subtitle.slice(0, 40), 540, 610); }
        ctx.font = '34px sans-serif';
        ctx.fillText('bornclock.com', 540, 980);
        canvas.toBlob((b) => resolve(b), 'image/png');
      } catch {
        resolve(null);
      }
    });

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await buildImage();
      const file = blob ? new File([blob], 'birthday-profile.png', { type: 'image/png' }) : null;
      const nav = navigator as any;
      if (file && nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: 'My Birthday Profile', text: `${name}'s birthday profile`, url });
      } else if (blob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'birthday-profile.png';
        a.click();
        URL.revokeObjectURL(a.href);
      } else if (nav.share) {
        await nav.share({ title: 'My Birthday Profile', url });
      }
    } catch {
      /* user cancelled or share unavailable */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      data-testid="share-profile-image"
      onClick={handleShare}
      disabled={busy}
      className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 ${className}`}
    >
      {busy ? 'Preparing…' : '🖼️ Share my profile as an image'}
    </button>
  );
}

export default ShareMyProfileButton;
