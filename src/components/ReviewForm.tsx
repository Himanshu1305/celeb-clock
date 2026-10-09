import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Real review collection (P3-7). A signed-in user submits their own rating + words; the
 * row is written with is_approved = false and only appears publicly after an admin
 * approves it (RLS: auth.uid() = user_id for insert). NO seeded or fabricated reviews
 * anywhere (Rule 8). The homepage carousel shows approved+featured reviews only.
 */
export function ReviewForm({ userId, defaultName = '', country = null }: { userId: string; defaultName?: string; country?: string | null }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [displayName, setDisplayName] = useState(defaultName);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (rating < 1) { setError('Please pick a star rating.'); return; }
    if (!displayName.trim()) { setError('Please add a display name.'); return; }
    if (content.trim().length < 10) { setError('Please write a little more (at least 10 characters).'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase.from('user_reviews').insert({
        user_id: userId,
        rating,
        title: title.trim() || 'My BornClock review',
        content: content.trim(),
        display_name: displayName.trim().slice(0, 60),
        country,
        is_approved: false,
        is_featured: false,
      });
      if (err) { setError('We couldn\'t submit that just now — please try again.'); return; }
      setDone(true);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
        <CardContent className="p-6">
          <p className="text-sm text-green-600 flex items-center gap-2"><Check className="h-4 w-4" /> Thank you! Your review was submitted and will appear once it's reviewed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-accent" /> Leave a review</CardTitle>
        <CardDescription>Share your honest experience. Reviews are shown publicly only after moderation.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Your rating</Label>
          <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-checked={rating === n}
                role="radio"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-0.5"
              >
                <Star className={`h-6 w-6 ${n <= (hover || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rv-name">Display name</Label>
          <Input id="rv-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="How your name appears" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rv-title">Title (optional)</Label>
          <Input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="A short headline" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rv-content">Your review</Label>
          <Textarea id="rv-content" value={content} onChange={(e) => setContent(e.target.value)} maxLength={1000} rows={4} placeholder="What did you find useful?" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />} Submit review
        </Button>
      </CardContent>
    </Card>
  );
}
