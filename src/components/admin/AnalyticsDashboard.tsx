import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Zap, BookOpen, TrendingUp, Globe } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AnalyticsData {
  pageViews: { name: string; views: number }[];
  featureUsage: { name: string; usage: number }[];
  blogReads: { name: string; reads: number }[];
  trends: { date: string; page_views: number; feature_uses: number; blog_reads: number }[];
  countryData: { country: string; count: number }[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(210, 70%, 50%)',
  'hsl(280, 60%, 50%)',
  'hsl(160, 60%, 45%)',
  'hsl(30, 80%, 55%)',
  'hsl(340, 70%, 50%)',
  'hsl(200, 65%, 55%)',
];

const formatPageName = (path: string): string => {
  if (path === '/') return 'Home';
  return path
    .replace(/^\//, '')
    .replace(/-/g, ' ')
    .replace(/\//g, ' / ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatFeatureName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData>({
    pageViews: [],
    featureUsage: [],
    blogReads: [],
    trends: [],
    countryData: []
  });
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    pageViews: 0,
    featureUses: 0,
    blogReads: 0,
    uniqueUsers: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch all analytics events
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch country data from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('country');

      // Process page views
      const pageViewMap = new Map<string, number>();
      const featureMap = new Map<string, number>();
      const blogMap = new Map<string, number>();
      const uniqueSessionIds = new Set<string>();
      
      events?.forEach(event => {
        if (event.session_id) uniqueSessionIds.add(event.session_id);
        
        if (event.event_type === 'page_view') {
          pageViewMap.set(event.event_name, (pageViewMap.get(event.event_name) || 0) + 1);
        } else if (event.event_type === 'feature_use') {
          featureMap.set(event.event_name, (featureMap.get(event.event_name) || 0) + 1);
        } else if (event.event_type === 'blog_read') {
          blogMap.set(event.event_name, (blogMap.get(event.event_name) || 0) + 1);
        }
      });

      // Process trends (last 7 days)
      const trends: { date: string; page_views: number; feature_uses: number; blog_reads: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayEvents = events?.filter(e => {
          const eventDate = new Date(e.created_at || '');
          return eventDate >= dayStart && eventDate <= dayEnd;
        }) || [];

        trends.push({
          date: format(date, 'MMM d'),
          page_views: dayEvents.filter(e => e.event_type === 'page_view').length,
          feature_uses: dayEvents.filter(e => e.event_type === 'feature_use').length,
          blog_reads: dayEvents.filter(e => e.event_type === 'blog_read').length
        });
      }

      // Process country data
      const countryMap = new Map<string, number>();
      profiles?.forEach((profile: { country?: string }) => {
        const country = profile.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      });

      setData({
        pageViews: Array.from(pageViewMap.entries())
          .map(([name, views]) => ({ name: formatPageName(name), views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10),
        featureUsage: Array.from(featureMap.entries())
          .map(([name, usage]) => ({ name: formatFeatureName(name), usage }))
          .sort((a, b) => b.usage - a.usage)
          .slice(0, 10),
        blogReads: Array.from(blogMap.entries())
          .map(([name, reads]) => ({ name: formatFeatureName(name), reads }))
          .sort((a, b) => b.reads - a.reads)
          .slice(0, 10),
        trends,
        countryData: Array.from(countryMap.entries())
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      });

      setTotals({
        pageViews: events?.filter(e => e.event_type === 'page_view').length || 0,
        featureUses: events?.filter(e => e.event_type === 'feature_use').length || 0,
        blogReads: events?.filter(e => e.event_type === 'blog_read').length || 0,
        uniqueUsers: uniqueSessionIds.size
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-500/10">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.pageViews}</p>
                <p className="text-sm text-muted-foreground">Page Views</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-500/10">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.featureUses}</p>
                <p className="text-sm text-muted-foreground">Feature Uses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-purple-500/10">
                <BookOpen className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.blogReads}</p>
                <p className="text-sm text-muted-foreground">Blog Reads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-orange-500/10">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.uniqueUsers}</p>
                <p className="text-sm text-muted-foreground">Unique Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <Eye className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="blogs" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="countries" className="gap-2">
            <Globe className="h-4 w-4" />
            Countries
          </TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Activity Trends (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.trends.some(t => t.page_views > 0 || t.feature_uses > 0 || t.blog_reads > 0) ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="page_views" name="Page Views" stroke="hsl(210, 70%, 50%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="feature_uses" name="Feature Uses" stroke="hsl(160, 60%, 45%)" strokeWidth={2} />
                    <Line type="monotone" dataKey="blog_reads" name="Blog Reads" stroke="hsl(280, 60%, 50%)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No activity data yet. Start using the app to generate analytics!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                {data.pageViews.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.pageViews.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No page view data yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Page Views Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.pageViews.length > 0 ? (
                      data.pageViews.map((page, index) => (
                        <TableRow key={page.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              {page.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{page.views}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
              </CardHeader>
              <CardContent>
                {data.featureUsage.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.featureUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="usage"
                        nameKey="name"
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                        }
                      >
                        {data.featureUsage.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No feature usage data yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Usage Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead className="text-right">Uses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.featureUsage.length > 0 ? (
                      data.featureUsage.map((feature, index) => (
                        <TableRow key={feature.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              {feature.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{feature.usage}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Blogs Tab */}
        <TabsContent value="blogs">
          <Card>
            <CardHeader>
              <CardTitle>Blog Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {data.blogReads.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.blogReads}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" angle={-45} textAnchor="end" height={80} />
                      <YAxis className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="reads" fill="hsl(280, 60%, 50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blog Post</TableHead>
                        <TableHead className="text-right">Reads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.blogReads.map((blog) => (
                        <TableRow key={blog.name}>
                          <TableCell className="font-medium">{blog.name}</TableCell>
                          <TableCell className="text-right">{blog.reads}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No blog read data yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Users by Country</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.countryData.slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        dataKey="count"
                        nameKey="country"
                        label={({ country, percent }) => 
                          percent > 0.05 ? `${country}: ${(percent * 100).toFixed(0)}%` : ''
                        }
                      >
                        {data.countryData.slice(0, 8).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No country data yet
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Country Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.countryData.length > 0 ? (
                      data.countryData.map((item, index) => (
                        <TableRow key={item.country}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              {item.country}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
