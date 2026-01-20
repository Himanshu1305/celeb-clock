import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { blogPosts, BlogPost, getAllTags, getPostsByTag, getPostsByCategory } from '@/data/blogPosts';
import { Calendar, Clock, User, Search, Tag, ArrowRight, BookOpen } from 'lucide-react';

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

const BlogCard = ({ post }: { post: BlogPost }) => (
  <Card className="glass-card hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className={categoryColors[post.category]}>
          {categoryLabels[post.category]}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readTime} min read
        </span>
      </div>
      <CardTitle className="text-xl leading-tight hover:text-primary transition-colors">
        <Link to={`/blog/${post.slug}`}>
          {post.title}
        </Link>
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 flex flex-col">
      <CardDescription className="text-sm mb-4 flex-1">
        {post.excerpt}
      </CardDescription>
      <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {post.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(post.publishedDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </span>
        </div>
        <Link 
          to={`/blog/${post.slug}`}
          className="text-primary hover:underline flex items-center gap-1"
        >
          Read more
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </CardContent>
  </Card>
);

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BlogPost['category'] | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = getAllTags();
  const categories: (BlogPost['category'] | 'all')[] = ['all', 'age-calculator', 'celebrity', 'zodiac', 'birthstone', 'life-expectancy', 'lifestyle'];

  // Filter posts
  let filteredPosts = blogPosts;
  
  if (selectedCategory !== 'all') {
    filteredPosts = getPostsByCategory(selectedCategory);
  }
  
  if (selectedTag) {
    filteredPosts = filteredPosts.filter(post => post.tags.includes(selectedTag));
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Featured post (most recent)
  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <SEO 
        title="Blog - Age Calculator & Birthday Insights"
        description="Explore articles about age calculation, celebrity birthdays, zodiac signs, birthstones, and life expectancy. Fun facts and practical guides for every birthday enthusiast."
        keywords="age calculator blog, birthday facts, zodiac signs, birthstones, celebrity birthdays, life expectancy"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8 pb-12 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold gradient-text-primary leading-tight">
              Our Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover fascinating insights about age, birthdays, zodiac signs, and what makes your special day unique.
            </p>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="max-w-6xl mx-auto mb-12">
          <div className="glass-card p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedTag(null);
                  }}
                >
                  {category === 'all' ? 'All Posts' : categoryLabels[category]}
                </Button>
              ))}
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {allTags.slice(0, 10).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Post */}
        {!searchQuery && selectedCategory === 'all' && !selectedTag && (
          <section className="max-w-6xl mx-auto mb-12">
            <h2 className="text-2xl font-bold mb-6 gradient-text-primary">Featured Article</h2>
            <Card className="glass-card overflow-hidden">
              <div className="md:flex">
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className={categoryColors[featuredPost.category]}>
                      {categoryLabels[featuredPost.category]}
                    </Badge>
                    <Badge variant="secondary">Featured</Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 hover:text-primary transition-colors">
                    <Link to={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(featuredPost.publishedDate).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime} min read
                    </span>
                  </div>
                  <Button asChild>
                    <Link to={`/blog/${featuredPost.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="md:w-1/3 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📖</div>
                    <p className="text-sm text-muted-foreground">
                      {featuredPost.readTime} minute read
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text-primary">
              {searchQuery ? 'Search Results' : selectedTag ? `Posts tagged "${selectedTag}"` : 'Latest Articles'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card className="glass-card p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedTag(null);
                }}
              >
                Clear Filters
              </Button>
            </Card>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/30">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4 gradient-text-primary">
                Never Miss an Article
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Get the latest insights about age calculation, celebrity birthdays, and more delivered straight to your inbox.
              </p>
              <div className="flex gap-2 max-w-md mx-auto">
                <Input placeholder="Enter your email" type="email" />
                <Button>Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      <Footer />
    </div>
  );
};

export default Blog;
