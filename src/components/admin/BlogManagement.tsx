import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit, 
  Trash2, 
  Sparkles,
  RefreshCw,
  Send,
  Calendar,
  Tag
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  status: string;
  is_auto_generated: boolean;
  read_time: number;
  created_at: string;
  published_at: string | null;
  review_notes: string | null;
  faqs: { question: string; answer: string }[] | null;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-600 border-gray-500/30',
  pending_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  approved: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  published: 'bg-green-500/10 text-green-600 border-green-500/30',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/30'
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending Review',
  approved: 'Approved',
  published: 'Published',
  rejected: 'Rejected'
};

export const BlogManagement = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Transform data to match our interface
      const transformedData = (data || []).map(post => ({
        ...post,
        faqs: (post.faqs as { question: string; answer: string }[] | null) || []
      }));
      setPosts(transformedData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const generateBlogPost = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-blog', {
        body: { forceGenerate: true }
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Blog post generated successfully!');
        fetchPosts();
      } else {
        toast.error(data.message || 'Failed to generate blog post');
      }
    } catch (error) {
      console.error('Error generating blog:', error);
      toast.error('Failed to generate blog post. Check edge function logs.');
    } finally {
      setGenerating(false);
    }
  };

  const updatePostStatus = async (postId: string, newStatus: string, notes?: string) => {
    try {
      const updateData: Record<string, unknown> = { 
        status: newStatus,
        review_notes: notes || null
      };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast.success(`Post ${statusLabels[newStatus].toLowerCase()}`);
      fetchPosts();
      setPreviewOpen(false);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post status');
    }
  };

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const openPreview = (post: BlogPost) => {
    setSelectedPost(post);
    setReviewNotes(post.review_notes || '');
    setPreviewOpen(true);
  };

  const pendingCount = posts.filter(p => p.status === 'pending_review').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">
            Manage auto-generated and manual blog posts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPosts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={generateBlogPost} disabled={generating}>
            <Sparkles className={`h-4 w-4 mr-2 ${generating ? 'animate-pulse' : ''}`} />
            {generating ? 'Generating...' : 'Generate New Post'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="pending_review" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending Review
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Published
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            <Edit className="h-4 w-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'all' 
                  ? 'Generate your first AI blog post or create one manually.'
                  : `No posts with status "${statusLabels[activeTab]}"`}
              </p>
              {activeTab === 'all' && (
                <Button onClick={generateBlogPost} disabled={generating}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate First Post
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={statusColors[post.status]}>
                            {statusLabels[post.status]}
                          </Badge>
                          <Badge variant="secondary">{post.category}</Badge>
                          {post.is_auto_generated && (
                            <Badge variant="outline" className="gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.read_time} min read
                          </span>
                          {post.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              {post.tags.slice(0, 3).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openPreview(post)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview/Review Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className={statusColors[selectedPost?.status || 'draft']}>
                {statusLabels[selectedPost?.status || 'draft']}
              </Badge>
              Review Blog Post
            </DialogTitle>
            <DialogDescription>
              Preview and approve or reject this blog post
            </DialogDescription>
          </DialogHeader>

          {selectedPost && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Post Meta */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{selectedPost.title}</h2>
                  <p className="text-muted-foreground">{selectedPost.excerpt}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{selectedPost.category}</Badge>
                    {selectedPost.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Content Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Content Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedPost.content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQs */}
                {selectedPost.faqs && selectedPost.faqs.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">FAQs ({selectedPost.faqs.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedPost.faqs.map((faq, i) => (
                        <div key={i} className="border-b pb-2 last:border-0">
                          <p className="font-medium text-sm">Q: {faq.question}</p>
                          <p className="text-sm text-muted-foreground">A: {faq.answer}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Review Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about this post..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2">
            {selectedPost?.status === 'pending_review' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updatePostStatus(selectedPost.id, 'rejected', reviewNotes)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updatePostStatus(selectedPost.id, 'approved', reviewNotes)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => updatePostStatus(selectedPost.id, 'published', reviewNotes)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Approve & Publish
                </Button>
              </>
            )}
            {selectedPost?.status === 'approved' && (
              <Button
                onClick={() => updatePostStatus(selectedPost.id, 'published', reviewNotes)}
              >
                <Send className="h-4 w-4 mr-2" />
                Publish Now
              </Button>
            )}
            {selectedPost?.status === 'draft' && (
              <Button
                onClick={() => updatePostStatus(selectedPost.id, 'pending_review', reviewNotes)}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
