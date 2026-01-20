import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ArticleSEO, FAQSchema } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getPostBySlug, getRelatedPosts, BlogPost } from '@/data/blogPosts';
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const categoryLabels: Record<BlogPost['category'], string> = {
  'age-calculator': 'Age Calculator',
  'celebrity': 'Celebrity',
  'zodiac': 'Zodiac',
  'birthstone': 'Birthstone',
  'life-expectancy': 'Life Expectancy',
  'lifestyle': 'Lifestyle'
};

const categoryColors: Record<BlogPost['category'], string> = {
  'age-calculator': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  'celebrity': 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  'zodiac': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30',
  'birthstone': 'bg-pink-500/10 text-pink-600 border-pink-500/30',
  'life-expectancy': 'bg-green-500/10 text-green-600 border-green-500/30',
  'lifestyle': 'bg-orange-500/10 text-orange-600 border-orange-500/30'
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = slug ? getPostBySlug(slug) : undefined;
  const relatedPosts = slug ? getRelatedPosts(slug, 3) : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-cosmic">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <Navigation />
            <AuthNav />
          </header>
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="text-6xl mb-6">📄</div>
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <ArticleSEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        slug={post.slug}
        author={post.author}
        publishedDate={post.publishedDate}
        modifiedDate={post.updatedDate}
        category={categoryLabels[post.category]}
        tags={post.tags}
        featuredImage={post.ogImage}
      />
      {post.faqs && post.faqs.length > 0 && (
        <FAQSchema items={post.faqs} />
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Breadcrumb */}
        <nav className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link to="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </div>
        </nav>

        {/* Article */}
        <article className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge variant="outline" className={categoryColors[post.category]}>
                {categoryLabels[post.category]}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} min read
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text-primary leading-tight">
              {post.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              {post.excerpt}
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </header>

          <Separator className="my-8" />

          {/* Article Content */}
          <div className="glass-card p-8 md:p-12 mb-8">
            <div className="
              prose prose-lg max-w-none
              dark:prose-invert
              
              prose-headings:font-heading
              prose-headings:font-bold
              prose-headings:text-foreground
              prose-headings:mt-8
              prose-headings:mb-4
              
              prose-h1:text-4xl
              prose-h1:bg-gradient-to-r
              prose-h1:from-primary
              prose-h1:to-accent
              prose-h1:bg-clip-text
              prose-h1:text-transparent
              prose-h1:mb-6
              
              prose-h2:text-2xl
              prose-h2:text-primary
              prose-h2:border-b
              prose-h2:border-primary/20
              prose-h2:pb-2
              
              prose-h3:text-xl
              prose-h3:text-foreground
              
              prose-h4:text-lg
              prose-h4:text-foreground
              prose-h4:font-semibold
              
              prose-p:text-foreground/90
              prose-p:leading-relaxed
              prose-p:mb-4
              
              prose-a:text-primary
              prose-a:font-medium
              prose-a:underline
              prose-a:underline-offset-2
              hover:prose-a:text-accent
              
              prose-strong:text-foreground
              prose-strong:font-bold
              
              prose-em:text-foreground/80
              prose-em:italic
              
              prose-ul:text-foreground/90
              prose-ul:my-4
              prose-ul:list-disc
              prose-ul:pl-6
              
              prose-ol:text-foreground/90
              prose-ol:my-4
              prose-ol:list-decimal
              prose-ol:pl-6
              
              prose-li:text-foreground/90
              prose-li:my-1
              prose-li:marker:text-primary
              
              prose-blockquote:border-l-4
              prose-blockquote:border-primary
              prose-blockquote:bg-primary/5
              prose-blockquote:py-2
              prose-blockquote:px-4
              prose-blockquote:my-6
              prose-blockquote:italic
              prose-blockquote:text-foreground/80
              
              prose-code:text-primary
              prose-code:bg-primary/10
              prose-code:px-1.5
              prose-code:py-0.5
              prose-code:rounded
              prose-code:text-sm
              prose-code:font-mono
              prose-code:before:content-none
              prose-code:after:content-none
              
              prose-pre:bg-muted
              prose-pre:rounded-lg
              prose-pre:p-4
              prose-pre:overflow-x-auto
              
              prose-table:w-full
              prose-table:my-6
              prose-table:border-collapse
              
              prose-th:bg-primary/10
              prose-th:text-foreground
              prose-th:font-bold
              prose-th:p-3
              prose-th:text-left
              prose-th:border
              prose-th:border-border
              
              prose-td:p-3
              prose-td:border
              prose-td:border-border
              prose-td:text-foreground/90
              
              prose-tr:even:bg-muted/30
              
              prose-hr:border-border
              prose-hr:my-8
              
              prose-img:rounded-lg
              prose-img:shadow-lg
              prose-img:my-6
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {post.tags.map((tag) => (
              <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>

          {/* FAQ Section */}
          {post.faqs && post.faqs.length > 0 && (
            <Card className="glass-card mb-8">
              <CardHeader>
                <CardTitle className="text-xl gradient-text-primary flex items-center gap-2">
                  ❓ Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border/50 last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold text-foreground mb-2">
                      Q: {faq.question}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      A: {faq.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Share */}
          <div className="flex items-center justify-between mb-12">
            <Button variant="outline" onClick={() => navigate('/blog')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Article
            </Button>
          </div>

          {/* Author Bio */}
          <Card className="glass-card mb-12">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
                  ⏰
                </div>
                <div>
                  <h3 className="font-bold text-lg">Team Celeb Clock</h3>
                  <p className="text-muted-foreground text-sm mb-2">Content Team</p>
                  <p className="text-sm text-muted-foreground">
                    The Celeb Clock team is passionate about helping you discover fascinating insights about age, birthdays, and longevity. We research and create content to make your special day even more meaningful.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6 gradient-text-primary flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="glass-card hover:scale-[1.02] transition-all">
                    <CardHeader className="pb-2">
                      <Badge variant="outline" className={`${categoryColors[relatedPost.category]} w-fit`}>
                        {categoryLabels[relatedPost.category]}
                      </Badge>
                      <CardTitle className="text-lg leading-tight hover:text-primary transition-colors">
                        <Link to={`/blog/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="text-primary text-sm hover:underline flex items-center gap-1"
                      >
                        Read more
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <Card className="glass-card mt-12 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 gradient-text-primary">
                Ready to Try Our Tools?
              </h2>
              <p className="text-muted-foreground mb-6">
                Calculate your exact age, find your celebrity birthday twins, and discover more about yourself.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link to="/">
                    Age Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/celebrity-birthday">
                    Celebrity Match
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/zodiac">
                    Zodiac Signs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPostPage;
