import { forwardRef } from 'react';
import type { CSSProperties } from 'react';

interface PlanetaryAgeCardProps {
  userName: string;
  birthDate: Date;
  planetAges: Record<string, number>;
  nextBirthdays: Record<string, number>;
  earthAge: number;
}

const PLANET_COLORS: Record<string, string> = {
  Mercury: '#b5b5b5',
  Venus: '#e8c44d',
  Earth: '#4fa3e0',
  Mars: '#e27b50',
  Jupiter: '#c88b3a',
  Saturn: '#e4c76b',
  Uranus: '#7de8e8',
  Neptune: '#4b70dd',
};

const PLANET_EMOJIS: Record<string, string> = {
  Mercury: '☿',
  Venus: '♀',
  Earth: '🌍',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '🪐',
  Uranus: '⛢',
  Neptune: '♆',
};

const PLANETS_ORDER = ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'];

// Seeded stars — consistent each render
const STARS = Array.from({ length: 80 }, (_, i) => ({
  top: `${(i * 37 + 13) % 100}%`,
  left: `${(i * 61 + 7) % 100}%`,
  size: (i % 3) + 1,
  opacity: 0.3 + (i % 5) * 0.14,
}));

export const PlanetaryAgeCard = forwardRef<HTMLDivElement, PlanetaryAgeCardProps>(
  ({ userName, birthDate, planetAges, nextBirthdays, earthAge }, ref) => {
    const cardStyle: CSSProperties = {
      width: '1080px',
      height: '1080px',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1040 50%, #0d1a2e 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      padding: '60px',
      boxSizing: 'border-box',
    };

    const formattedBirthDate = birthDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Highlight strip — most interesting stat
    const mercuryDays = nextBirthdays['Mercury'];
    const jupiterAge = planetAges['Jupiter'];
    let highlightText = '';
    if (mercuryDays !== undefined && mercuryDays <= 88) {
      highlightText = `🎂 Next Mercury birthday in ${mercuryDays} days`;
    } else if (jupiterAge !== undefined) {
      highlightText = `🪐 On Jupiter, you'd only be ${jupiterAge.toFixed(1)} years old`;
    }

    return (
      <div ref={ref} style={cardStyle}>
        {/* Star field */}
        {STARS.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              background: 'white',
              opacity: star.opacity,
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* SECTION 1: Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: '18px',
                letterSpacing: '0.2em',
                color: '#6366f1',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              🎂 BORNCLOCK
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: '900',
                color: 'white',
                lineHeight: 1.1,
                marginBottom: '10px',
              }}
            >
              {userName ? `${userName}'s Cosmic Age Report` : 'My Cosmic Age Report'}
            </div>
            <div style={{ fontSize: '20px', color: '#94a3b8' }}>Born {formattedBirthDate}</div>
          </div>
          <div style={{ fontSize: '80px', lineHeight: 1 }}>🌌</div>
        </div>

        {/* SECTION 2: Divider */}
        <div
          style={{
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, #6366f1, #8b5cf6, transparent)',
            marginBottom: '32px',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* SECTION 3: Planet grid 4×2 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '28px',
            position: 'relative',
            zIndex: 1,
            flex: 1,
          }}
        >
          {PLANETS_ORDER.map(name => {
            const age = name === 'Earth' ? earthAge : planetAges[name];
            const color = PLANET_COLORS[name];
            const emoji = PLANET_EMOJIS[name];
            if (age === undefined) return null;

            let ageDisplay: string;
            if (name === 'Earth') {
              ageDisplay = `${earthAge} yrs`;
            } else if (age < 1) {
              ageDisplay = `${age.toFixed(2)} yrs`;
            } else {
              ageDisplay = `${age.toFixed(1)} yrs`;
            }

            return (
              <div
                key={name}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  borderLeft: `3px solid ${color}`,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '32px', lineHeight: 1.2 }}>{emoji}</div>
                <div style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>{name}</div>
                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: name === 'Earth' ? '#4fa3e0' : 'white',
                    marginTop: '2px',
                  }}
                >
                  {ageDisplay}
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 4: Highlight strip */}
        {highlightText && (
          <div
            style={{
              background: 'rgba(99, 102, 241, 0.3)',
              border: '1px solid rgba(99, 102, 241, 0.5)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center',
              fontSize: '20px',
              color: 'white',
              marginBottom: '24px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {highlightText}
          </div>
        )}

        {/* SECTION 5: Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: '14px', color: '#475569' }}>
            NASA JPL data · Kepler's Third Law (1619)
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>
              BornClock
            </div>
            <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'rgba(255,255,255,0.5)' }}>
              Know your time. Live it well.
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
              bornclock.com/planetary-age
            </div>
          </div>
        </div>
      </div>
    );
  },
);

PlanetaryAgeCard.displayName = 'PlanetaryAgeCard';
