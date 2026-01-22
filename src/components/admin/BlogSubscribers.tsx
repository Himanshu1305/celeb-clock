import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Search, Download, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Subscriber {
  id: string;
  first_name?: string;
  last_name?: string;
  name: string;
  email: string;
  country?: string;
  created_at: string;
  premium_status: boolean;
}

export const BlogSubscribers = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Filter for blog subscribers (default is true, so include those without explicit false)
        const allData = data as any[];
        const subscribersData = allData?.filter(p => p.blog_subscription !== false) || [];
        
        setSubscribers(subscribersData);
        setFilteredSubscribers(subscribersData);
      } catch (err) {
        console.error('Error fetching subscribers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  useEffect(() => {
    const filtered = subscribers.filter(sub => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${sub.first_name || ''} ${sub.last_name || ''} ${sub.name || ''}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        sub.email.toLowerCase().includes(searchLower) ||
        (sub.country?.toLowerCase() || '').includes(searchLower)
      );
    });
    setFilteredSubscribers(filtered);
  }, [searchTerm, subscribers]);

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Country', 'Premium', 'Signup Date'];
    const csvData = filteredSubscribers.map(sub => [
      sub.first_name && sub.last_name 
        ? `${sub.first_name} ${sub.last_name}` 
        : sub.name || 'N/A',
      sub.email,
      sub.country || 'N/A',
      sub.premium_status ? 'Yes' : 'No',
      new Date(sub.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `blog_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{subscribers.length}</p>
                <p className="text-sm text-muted-foreground">Total Blog Subscribers</p>
              </div>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signup Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {subscriber.first_name && subscriber.last_name 
                        ? `${subscriber.first_name} ${subscriber.last_name}` 
                        : subscriber.name || 'N/A'}
                    </TableCell>
                    <TableCell>{subscriber.email}</TableCell>
                    <TableCell>{subscriber.country || 'N/A'}</TableCell>
                    <TableCell>
                      {subscriber.premium_status ? (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      ) : (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubscribers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No subscribers match your search' : 'No blog subscribers yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
