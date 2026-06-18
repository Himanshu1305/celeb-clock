interface GemProps {
  color: string;
  size: number;
  uid: string;
}

function OvalGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`og-${uid}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.55" />
          <stop offset="55%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="52" rx="34" ry="43" fill={`url(#og-${uid})`} />
      <line x1="50" y1="9" x2="16" y2="30" stroke="white" strokeWidth="0.9" strokeOpacity="0.35" />
      <line x1="50" y1="9" x2="84" y2="30" stroke="white" strokeWidth="0.9" strokeOpacity="0.35" />
      <line x1="16" y1="30" x2="50" y2="52" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
      <line x1="84" y1="30" x2="50" y2="52" stroke="white" strokeWidth="0.7" strokeOpacity="0.25" />
      <line x1="50" y1="9" x2="50" y2="52" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="16" y1="74" x2="50" y2="52" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      <line x1="84" y1="74" x2="50" y2="52" stroke="white" strokeWidth="0.6" strokeOpacity="0.18" />
      <ellipse cx="37" cy="32" rx="10" ry="6" fill="white" fillOpacity="0.32" transform="rotate(-22,37,32)" />
      <ellipse cx="35" cy="30" rx="4" ry="2.5" fill="white" fillOpacity="0.52" transform="rotate(-22,35,30)" />
    </svg>
  );
}

function CushionGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`cg-${uid}`} cx="36%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect x="12" y="12" width="76" height="76" rx="14" ry="14" fill={`url(#cg-${uid})`} />
      <line x1="12" y1="26" x2="26" y2="12" stroke="white" strokeWidth="0.9" strokeOpacity="0.35" />
      <line x1="88" y1="26" x2="74" y2="12" stroke="white" strokeWidth="0.9" strokeOpacity="0.35" />
      <line x1="50" y1="12" x2="50" y2="88" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="12" y1="50" x2="88" y2="50" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="12" y1="26" x2="50" y2="50" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <line x1="88" y1="26" x2="50" y2="50" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <rect x="30" y="30" width="40" height="40" rx="6" fill="white" fillOpacity="0.08" />
      <ellipse cx="34" cy="30" rx="9" ry="5.5" fill="white" fillOpacity="0.38" transform="rotate(-15,34,30)" />
    </svg>
  );
}

function EmeraldCutGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`ec-${uid}`} cx="38%" cy="32%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="55%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </radialGradient>
      </defs>
      <polygon points="30,8 70,8 92,30 92,70 70,92 30,92 8,70 8,30" fill={`url(#ec-${uid})`} />
      <polygon points="38,18 62,18 80,36 80,64 62,82 38,82 20,64 20,36" fill="white" fillOpacity="0.07" />
      <line x1="30" y1="8" x2="20" y2="36" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="70" y1="8" x2="80" y2="36" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="8" y1="30" x2="8" y2="70" stroke="white" strokeWidth="0.8" strokeOpacity="0.22" />
      <line x1="92" y1="30" x2="92" y2="70" stroke="white" strokeWidth="0.8" strokeOpacity="0.22" />
      <line x1="20" y1="36" x2="80" y2="36" stroke="white" strokeWidth="0.7" strokeOpacity="0.28" />
      <line x1="20" y1="64" x2="80" y2="64" stroke="white" strokeWidth="0.7" strokeOpacity="0.2" />
      <ellipse cx="36" cy="28" rx="9" ry="5" fill="white" fillOpacity="0.35" transform="rotate(-18,36,28)" />
    </svg>
  );
}

function BrilliantGem({ color, size, uid }: GemProps) {
  const facets = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    const x = 50 + 35 * Math.cos(angle);
    const y = 50 + 35 * Math.sin(angle);
    return `${x},${y}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`bg-${uid}`} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.65" />
          <stop offset="45%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#bg-${uid})`} />
      {facets.map((pt, i) => (
        <line key={i} x1="50" y1="50" x2={pt.split(',')[0]} y2={pt.split(',')[1]}
          stroke="white" strokeWidth="0.9" strokeOpacity="0.28" />
      ))}
      <circle cx="50" cy="50" r="18" fill="white" fillOpacity="0.1" />
      <ellipse cx="36" cy="32" rx="11" ry="7" fill="white" fillOpacity="0.45" transform="rotate(-25,36,32)" />
      <ellipse cx="34" cy="30" rx="5" ry="3" fill="white" fillOpacity="0.65" transform="rotate(-25,34,30)" />
    </svg>
  );
}

function PearlGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`pg-${uid}`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9" />
          <stop offset="40%" stopColor={color} stopOpacity="0.6" />
          <stop offset="75%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="42" fill={`url(#pg-${uid})`} />
      <ellipse cx="36" cy="30" rx="14" ry="9" fill="white" fillOpacity="0.55" transform="rotate(-20,36,30)" />
      <ellipse cx="34" cy="28" rx="6" ry="4" fill="white" fillOpacity="0.75" transform="rotate(-20,34,28)" />
      <circle cx="64" cy="66" r="6" fill="white" fillOpacity="0.18" />
    </svg>
  );
}

function PearGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`prg-${uid}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="55%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path d="M50,92 C26,75 12,60 14,42 C16,24 32,10 50,10 C68,10 84,24 86,42 C88,60 74,75 50,92 Z"
        fill={`url(#prg-${uid})`} />
      <line x1="50" y1="10" x2="14" y2="42" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="50" y1="10" x2="86" y2="42" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="50" y1="10" x2="50" y2="92" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="14" y1="42" x2="50" y2="55" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <line x1="86" y1="42" x2="50" y2="55" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <ellipse cx="37" cy="30" rx="9" ry="5.5" fill="white" fillOpacity="0.38" transform="rotate(-20,37,30)" />
    </svg>
  );
}

function CabochonGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`cab-${uid}`} cx="38%" cy="28%" r="72%">
          <stop offset="0%" stopColor="white" stopOpacity="0.7" />
          <stop offset="45%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.65" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="46" rx="40" ry="38" fill={`url(#cab-${uid})`} />
      <ellipse cx="50" cy="84" rx="38" ry="6" fill={color} fillOpacity="0.25" />
      <ellipse cx="37" cy="28" rx="13" ry="8" fill="white" fillOpacity="0.42" transform="rotate(-20,37,28)" />
      <ellipse cx="35" cy="26" rx="5.5" ry="3.5" fill="white" fillOpacity="0.65" transform="rotate(-20,35,26)" />
    </svg>
  );
}

function PrincessGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`psg-${uid}`} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="52%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect x="12" y="12" width="76" height="76" fill={`url(#psg-${uid})`} />
      <line x1="12" y1="12" x2="88" y2="88" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" />
      <line x1="88" y1="12" x2="12" y2="88" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" />
      <line x1="50" y1="12" x2="50" y2="88" stroke="white" strokeWidth="0.8" strokeOpacity="0.22" />
      <line x1="12" y1="50" x2="88" y2="50" stroke="white" strokeWidth="0.8" strokeOpacity="0.22" />
      <rect x="28" y="28" width="44" height="44" fill="white" fillOpacity="0.07" />
      <ellipse cx="33" cy="28" rx="9" ry="5.5" fill="white" fillOpacity="0.38" transform="rotate(-15,33,28)" />
    </svg>
  );
}

function TeardropGem({ color, size, uid }: GemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <radialGradient id={`tg-${uid}`} cx="38%" cy="30%" r="65%">
          <stop offset="0%" stopColor="white" stopOpacity="0.5" />
          <stop offset="55%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <path d="M50,90 C30,72 10,54 10,38 C10,20 28,8 50,8 C72,8 90,20 90,38 C90,54 70,72 50,90 Z"
        fill={`url(#tg-${uid})`} />
      <line x1="50" y1="8" x2="10" y2="38" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="50" y1="8" x2="90" y2="38" stroke="white" strokeWidth="0.9" strokeOpacity="0.3" />
      <line x1="50" y1="8" x2="50" y2="90" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
      <line x1="10" y1="38" x2="50" y2="52" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <line x1="90" y1="38" x2="50" y2="52" stroke="white" strokeWidth="0.7" strokeOpacity="0.22" />
      <ellipse cx="37" cy="26" rx="9" ry="5.5" fill="white" fillOpacity="0.38" transform="rotate(-20,37,26)" />
    </svg>
  );
}

type GemComponent = (props: GemProps) => JSX.Element;

const gemData: Record<number, { Component: GemComponent; color: string }> = {
  1:  { Component: OvalGem,        color: '#C41E3A' },
  2:  { Component: CushionGem,     color: '#9B59B6' },
  3:  { Component: EmeraldCutGem,  color: '#7ECCD0' },
  4:  { Component: BrilliantGem,   color: '#E8E8F0' },
  5:  { Component: EmeraldCutGem,  color: '#50C878' },
  6:  { Component: PearlGem,       color: '#F5ECD8' },
  7:  { Component: OvalGem,        color: '#E0115F' },
  8:  { Component: CushionGem,     color: '#9DC183' },
  9:  { Component: TeardropGem,    color: '#0F52BA' },
  10: { Component: PearGem,        color: '#FF6B9D' },
  11: { Component: PrincessGem,    color: '#FFC200' },
  12: { Component: CabochonGem,    color: '#40C4FF' },
};

export function GemIllustration({ month, size = 120 }: { month: number; size?: number }) {
  const gem = gemData[month];
  if (!gem) return <div style={{ width: size, height: size }} className="flex items-center justify-center text-4xl">💎</div>;
  const { Component, color } = gem;
  return <Component color={color} size={size} uid={String(month)} />;
}
