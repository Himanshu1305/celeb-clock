import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Download, Twitter, Facebook, Instagram, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

interface Props {
  birthDate: Date | null;
  ageData: any;
  celebrities: any[];
  lifeExpectancy?: number | null;
}

export const ShareAndExport = ({ birthDate, ageData, celebrities, lifeExpectancy }: Props) => {
  const { isPremium } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!birthDate || !ageData) return null;

  const generateShareText = () => {
    const age = ageData.years;
    const totalDays = ageData.totalDays.toLocaleString();
    const celebrityMatch = celebrities.length > 0 ? ` I share a birthday with ${celebrities[0].name}!` : '';
    const lifeText = isPremium && lifeExpectancy ? ` My life expectancy is ${lifeExpectancy} more years.` : '';
    
    return `I'm exactly ${age} years old and have lived ${totalDays} days!${celebrityMatch}${lifeText} Check out your age stats at ${window.location.origin}`;
  };

  const handleShare = async (platform: string) => {
    const text = generateShareText();
    const url = window.location.origin;
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('Text copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      }
      return;
    }

    // Try Web Share API first (mobile-friendly)
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Age Stats',
          text: text,
          url: url
        });
        toast.success('Shared successfully!');
        return;
      } catch (error) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', error);
      }
    }

    // Fallback to platform-specific URLs
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      instagram: url
    };

    if (platform === 'instagram') {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied! Paste it in your Instagram story or bio.');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    } else {
      // Open in new window
      const shareWindow = window.open(
        shareUrls[platform as keyof typeof shareUrls], 
        '_blank', 
        'width=600,height=400,menubar=no,toolbar=no'
      );
      
      // Check if popup was blocked
      if (!shareWindow || shareWindow.closed || typeof shareWindow.closed === 'undefined') {
        // Popup blocked, copy link instead
        try {
          await navigator.clipboard.writeText(shareUrls[platform as keyof typeof shareUrls]);
          toast.info('Popup blocked. Share link copied to clipboard!');
        } catch (error) {
          toast.error('Please allow popups for this site to share');
        }
      }
    }
  };

  // Note: PDF export is now handled by the EnhancedLifeExpectancyReport component

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-accent/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Share2 className="w-5 h-5 text-accent" />
          Share Your Time Capsule
        </CardTitle>
        <CardDescription>
          Show off your age stats and birthday twins
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Social Sharing */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Share on Social Media</h3>
          
          {/* Native Share Button (mobile) */}
          {navigator.share && (
            <Button
              variant="default"
              onClick={() => handleShare('native')}
              className="w-full"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex-1 min-w-[120px]"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex-1 min-w-[120px]"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('instagram')}
              className="flex-1 min-w-[120px]"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => handleShare('copy')}
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Share Text
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            If popups are blocked, links will be copied to your clipboard
          </p>
        </div>

        {/* PDF Export Info */}
        {isPremium && lifeExpectancy && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-medium">Export Your Complete Report</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Your detailed life capsule report with charts and analysis can be downloaded as PDF using the "Export PDF" button above the report.
            </p>
          </div>
        )}
        
        {!isPremium && (
          <div className="text-center space-y-2 p-4 bg-accent/5 rounded-lg border border-accent/20">
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              Premium Feature
            </Badge>
            <p className="text-sm text-muted-foreground">
              Upgrade to export personalized PDF reports with charts, analysis, and your complete time capsule data
            </p>
            <Link to="/upgrade">
              <Button variant="outline" className="w-full mt-2">
                <Download className="w-4 h-4 mr-2" />
                Upgrade to Export PDF
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};