import { useEffect, useState } from 'react';
import { Star, Check, X, Trash2, Award, RefreshCw, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  title: string;
  content: string;
  country: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
    </div>
  );
};

export const ReviewManagement = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReview = async (id: string, updates: Partial<Review>) => {
    try {
      const { error } = await supabase
        .from('user_reviews')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setReviews(prev => 
        prev.map(r => r.id === id ? { ...r, ...updates } : r)
      );

      toast({
        title: 'Success',
        description: 'Review updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update review.',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('user_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReviews(prev => prev.filter(r => r.id !== id));

      toast({
        title: 'Deleted',
        description: 'Review has been deleted.',
      });
    } catch (error) {
      console.error('Failed to delete review:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete review.',
        variant: 'destructive',
      });
    }
  };

  const pendingReviews = reviews.filter(r => !r.is_approved);
  const approvedReviews = reviews.filter(r => r.is_approved);
  const featuredReviews = reviews.filter(r => r.is_featured);

  const ReviewCard = ({ review }: { review: Review }) => (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={review.rating} />
              {review.is_approved && (
                <Badge variant="secondary" className="text-xs">Approved</Badge>
              )}
              {review.is_featured && (
                <Badge className="bg-accent text-xs">Featured</Badge>
              )}
            </div>
            
            <h4 className="font-semibold text-foreground">"{review.title}"</h4>
            <p className="text-sm text-muted-foreground">{review.content}</p>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-medium">{review.display_name}</span>
              {review.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {review.country}
                </span>
              )}
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            {!review.is_approved ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => updateReview(review.id, { is_approved: true })}
                >
                  <Check className="h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => deleteReview(review.id)}
                >
                  <X className="h-3 w-3" />
                  Reject
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant={review.is_featured ? "default" : "outline"}
                  className={`gap-1 ${review.is_featured ? 'bg-accent hover:bg-accent/90' : ''}`}
                  onClick={() => updateReview(review.id, { is_featured: !review.is_featured })}
                >
                  <Award className="h-3 w-3" />
                  {review.is_featured ? 'Featured' : 'Feature'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => deleteReview(review.id)}
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Review Management</h2>
          <p className="text-muted-foreground">Moderate user reviews and testimonials</p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{pendingReviews.length}</CardTitle>
            <CardDescription>Pending Review</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{approvedReviews.length}</CardTitle>
            <CardDescription>Approved</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{featuredReviews.length}</CardTitle>
            <CardDescription>Featured</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingReviews.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedReviews.length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({featuredReviews.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No pending reviews to moderate.
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4 mt-4">
          {approvedReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No approved reviews yet.
              </CardContent>
            </Card>
          ) : (
            approvedReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4 mt-4">
          {featuredReviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No featured reviews. Approve and feature reviews to display them on the homepage.
              </CardContent>
            </Card>
          ) : (
            featuredReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
