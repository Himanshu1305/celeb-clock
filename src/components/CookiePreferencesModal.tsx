import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Cookie, BarChart3, Megaphone, Shield, ExternalLink } from 'lucide-react';


interface CookiePreferencesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
}

export const CookiePreferencesModal = ({ 
  open, 
  onOpenChange, 
  onSave 
}: CookiePreferencesModalProps) => {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const handleSave = () => {
    onSave({ analytics, marketing });
  };

  const handleAcceptAll = () => {
    onSave({ analytics: true, marketing: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5 text-accent" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Essential Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium">Essential Cookies</Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Required for the website to function properly. These cannot be disabled as they are necessary for basic features like page navigation and security.
                </p>
              </div>
            </div>
            <Switch checked disabled className="opacity-50" />
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg mt-0.5">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="analytics" className="text-sm font-medium cursor-pointer">
                  Analytics Cookies
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service.
                </p>
              </div>
            </div>
            <Switch 
              id="analytics"
              checked={analytics} 
              onCheckedChange={setAnalytics}
            />
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg mt-0.5">
                <Megaphone className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="marketing" className="text-sm font-medium cursor-pointer">
                  Marketing Cookies
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user.
                </p>
              </div>
            </div>
            <Switch 
              id="marketing"
              checked={marketing} 
              onCheckedChange={setMarketing}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          For more information about how we use cookies, please read our{' '}
          <a href="/privacy" className="text-accent hover:underline inline-flex items-center gap-1">
            Privacy Policy
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSave}>
            Save Preferences
          </Button>
          <Button onClick={handleAcceptAll} className="bg-accent hover:bg-accent/90">
            Accept All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
