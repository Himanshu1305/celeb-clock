import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Cookie, Settings, X } from 'lucide-react';
import { CookiePreferencesModal } from './CookiePreferencesModal';

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

const COOKIE_CONSENT_KEY = 'cookie_consent';
const CONSENT_VERSION = '1.0';

export const getStoredConsent = (): CookiePreferences | null => {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.debug('Failed to parse cookie consent:', e);
  }
  return null;
};

export const hasAnalyticsConsent = (): boolean => {
  const consent = getStoredConsent();
  return consent?.analytics === true;
};

export const hasMarketingConsent = (): boolean => {
  const consent = getStoredConsent();
  return consent?.marketing === true;
};

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      // Delay showing banner for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (preferences: Omit<CookiePreferences, 'timestamp' | 'version' | 'essential'>) => {
    const consent: CookiePreferences = {
      essential: true,
      analytics: preferences.analytics,
      marketing: preferences.marketing,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    setIsVisible(false);
    setShowPreferences(false);
    
    // Reload to apply analytics consent changes
    window.location.reload();
  };

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    saveConsent({ analytics: false, marketing: false });
  };

  if (!isVisible && !showPreferences) return null;

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
          <Card className="max-w-4xl mx-auto p-6 bg-card/95 backdrop-blur-md border-border shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-full shrink-0">
                <Cookie className="h-6 w-6 text-accent" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                    We value your privacy 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies. You can customize your preferences or reject non-essential cookies.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleAcceptAll} className="bg-accent hover:bg-accent/90">
                    Accept All
                  </Button>
                  <Button variant="outline" onClick={handleRejectAll}>
                    Reject All
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowPreferences(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  By continuing to use this site, you agree to our{' '}
                  <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
                  {' '}and{' '}
                  <a href="/terms" className="text-accent hover:underline">Terms of Service</a>.
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRejectAll}
                className="shrink-0"
                aria-label="Close cookie banner"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}

      <CookiePreferencesModal 
        open={showPreferences} 
        onOpenChange={setShowPreferences}
        onSave={saveConsent}
      />
    </>
  );
};
