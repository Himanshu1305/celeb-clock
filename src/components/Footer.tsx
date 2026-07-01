import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CookiePreferencesModal } from '@/components/CookiePreferencesModal';
import { getStoredConsent } from '@/components/CookieConsent';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight } from 'lucide-react';

const SHARE_TEXT = 'Check out BornClock — find your age on every planet, celebrity birthday twins, life expectancy, zodiac & more!';
const SHARE_URL = 'https://bornclock.com';

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zM17.083 19.77h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const Footer = () => {
  const { user } = useAuth();
  const [showCookiePrefs, setShowCookiePrefs] = useState(false);

  const handleSaveCookiePrefs = (prefs: { analytics: boolean; marketing: boolean }) => {
    const consent = {
      essential: true as const,
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setShowCookiePrefs(false);
    window.location.reload();
  };

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`;

  return (
    <footer className="mt-16 border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Column 1 — Explore */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-sm">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/celebrity-birthday" className="text-muted-foreground hover:text-accent transition-colors">Celebrity Birthdays</Link></li>
              <li><Link to="/age-calculator" className="text-muted-foreground hover:text-accent transition-colors">Today's Birthdays</Link></li>
              <li><Link to="/zodiac" className="text-muted-foreground hover:text-accent transition-colors">Zodiac Signs</Link></li>
              <li><Link to="/birthstone" className="text-muted-foreground hover:text-accent transition-colors">Birthstone Finder</Link></li>
              <li><Link to="/numerology" className="text-muted-foreground hover:text-accent transition-colors">Numerology</Link></li>
            </ul>
          </div>

          {/* Column 2 — Tools */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-sm">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/life-expectancy" className="text-muted-foreground hover:text-accent transition-colors">Life Expectancy Calculator</Link></li>
              <li><Link to="/planetary-age" className="text-muted-foreground hover:text-accent transition-colors">Planetary Age Calculator</Link></li>
              <li><Link to="/life-expectancy#simulator" className="text-muted-foreground hover:text-accent transition-colors">What-If Simulator</Link></li>
              <li><Link to="/age-calculator" className="text-muted-foreground hover:text-accent transition-colors">Age Calculator</Link></li>
              <li><Link to="/leaderboard" className="text-muted-foreground hover:text-accent transition-colors">Longevity Leaderboard</Link></li>
              <li><Link to="/family" className="text-muted-foreground hover:text-accent transition-colors">Family Dashboard</Link></li>
              <li><Link to="/birthday-report" className="text-muted-foreground hover:text-accent transition-colors">Gift a Report</Link></li>
              <li><Link to="/biological-age" className="text-muted-foreground hover:text-accent transition-colors">Biological Age Test</Link></li>
              <li><Link to="/country-comparison" className="text-muted-foreground hover:text-accent transition-colors">Country Comparison</Link></li>
              <li><Link to="/birthday-report" className="text-muted-foreground hover:text-accent transition-colors">Birthday Report</Link></li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-sm">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/methodology" className="text-muted-foreground hover:text-accent transition-colors">How It Works</Link></li>
              <li><Link to="/faq" className="text-muted-foreground hover:text-accent transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-accent transition-colors">Terms of Service</Link></li>
              <li>
                <a href="mailto:hello@bornclock.com" className="text-muted-foreground hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <button
                  onClick={() => setShowCookiePrefs(true)}
                  className="text-muted-foreground hover:text-accent transition-colors text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 — Share */}
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-3 text-sm">Share BornClock</h3>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Know someone who'd love to see their age on Mars or find their celebrity birthday twin?
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white text-xs font-medium hover:opacity-90 transition-opacity w-fit"
              >
                <XIcon />
                Share on X
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity w-fit"
                style={{ backgroundColor: '#25D366' }}
              >
                <WhatsAppIcon />
                Share on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Join CTA */}
        {!user && (
          <div className="mb-8 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20 text-center">
            <h3 className="font-heading font-semibold text-foreground text-lg mb-2">Join BornClock</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a free account to unlock the Life Expectancy Calculator, save your results, and get celebrity birthday matches.
            </p>
            <Button asChild size="sm" className="gap-1">
              <Link to="/auth?signup=true">
                Sign Up Free
                <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        )}

        <Separator className="mb-6" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BornClock. All rights reserved.</p>
          <p>Made with care in India 🇮🇳</p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Designed and maintained by <span className="font-medium">USD VISION AI LLP</span>
          </p>
        </div>
      </div>

      <CookiePreferencesModal
        open={showCookiePrefs}
        onOpenChange={setShowCookiePrefs}
        onSave={handleSaveCookiePrefs}
      />
    </footer>
  );
};
