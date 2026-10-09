import { useEffect, useState } from 'react';
import { Star, Quote, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  user_id: string;
  display_name: string;
  rating: number;
  title: string;
  content: string;
  country: string | null;
  created_at: string;
}

// Honesty guard (Rule 8): an earlier migration seeded 7 fabricated testimonials with
// sentinel user_ids (00000000-0000-0000-0000-00000000000N). They are deleted in
// supabase/migrations/NOTES-remove-seeded-reviews.sql, but we ALSO exclude them in code
// so no fabricated review can ever render, regardless of whether that DELETE has run yet.
const isSeededFake = (userId: string | null | undefined) =>
  !!userId && /^00000000-0000-0000-0000-0000000000\d+$/.test(userId);

const countryFlags: Record<string, string> = {
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'Canada': '🇨🇦',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'India': '🇮🇳',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿',
  'Ireland': '🇮🇪',
  'Singapore': '🇸🇬',
};

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

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('user_reviews')
          .select('id, user_id, display_name, rating, title, content, country, created_at')
          .eq('is_approved', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        // Never render the seeded fakes even if they still exist in the DB.
        setReviews((data || []).filter((r) => !isSeededFake((r as Review).user_id)));
      } catch (error) {
        console.debug('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading testimonials...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-card/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-current" />
            Real reviews from BornClock users
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every review here is submitted by a real, signed-in user and shown only after moderation.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-12">
          <Carousel
            opts={{
              align: 'start',
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {reviews.map((review) => (
                <CarouselItem 
                  key={review.id} 
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/30 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Quote Icon */}
                      <Quote className="h-8 w-8 text-accent/20 mb-4" />
                      
                      {/* Rating */}
                      <div className="mb-3">
                        <StarRating rating={review.rating} />
                      </div>
                      
                      {/* Title */}
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        "{review.title}"
                      </h3>
                      
                      {/* Content */}
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">
                        {review.content}
                      </p>
                      
                      {/* Author */}
                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {review.display_name}
                          </p>
                          {review.country && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <span>{countryFlags[review.country] || '🌍'}</span>
                              {review.country}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground/60">
                          Verified User
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};
