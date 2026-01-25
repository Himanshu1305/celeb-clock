import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormProps {
  onSuccess?: () => void;
}

export const ReviewForm = ({ onSuccess }: ReviewFormProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to leave a review.',
        variant: 'destructive',
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Please fill all fields',
        description: 'Both title and review content are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const displayName = profile?.name || profile?.first_name || 'Anonymous User';
      const country = profile?.country || null;

      const { error } = await supabase.from('user_reviews').insert({
        user_id: user.id,
        rating,
        title: title.trim(),
        content: content.trim(),
        display_name: displayName,
        country,
        is_approved: false,
        is_featured: false,
      });

      if (error) throw error;

      toast({
        title: 'Thank you for your review! 🎉',
        description: 'Your review has been submitted and will be published after moderation.',
      });

      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit your review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Share Your Experience</CardTitle>
          <CardDescription>
            Sign in to leave a review and help others discover our app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" className="w-full">
            <a href="/auth">Sign in to Review</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Share Your Experience</CardTitle>
        <CardDescription>
          Help others by sharing your honest feedback about our app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="review-title">Title</Label>
            <Input
              id="review-title"
              placeholder="Sum up your experience in a few words"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review</Label>
            <Textarea
              id="review-content"
              placeholder="Tell us about your experience with our age calculator..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/500
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || !title.trim() || !content.trim()}
            className="w-full bg-accent hover:bg-accent/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Your review will be displayed with your profile name: <strong>{profile?.name || profile?.first_name || 'Anonymous'}</strong>
            {profile?.country && <> from <strong>{profile.country}</strong></>}
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
