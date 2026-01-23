import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Crown, UserCheck, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  name: string;
  email: string;
  country?: string;
  created_at: string;
  premium_status: boolean;
  blog_subscription: boolean;
  email_notifications: boolean;
}

type FilterType = 'all' | 'premium' | 'free';

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: User | null;
    newStatus: boolean;
  }>({ open: false, user: null, newStatus: false });
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Apply filter
    if (filter === 'premium') {
      filtered = filtered.filter(u => u.premium_status);
    } else if (filter === 'free') {
      filtered = filtered.filter(u => !u.premium_status);
    }

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const fullName = `${user.first_name || ''} ${user.last_name || ''} ${user.name || ''}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.country?.toLowerCase() || '').includes(searchLower)
        );
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filter, users]);

  const handlePremiumToggle = (user: User) => {
    setConfirmDialog({
      open: true,
      user,
      newStatus: !user.premium_status
    });
  };

  const confirmPremiumChange = async () => {
    if (!confirmDialog.user) return;

    setUpdating(confirmDialog.user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ premium_status: confirmDialog.newStatus })
        .eq('id', confirmDialog.user.id);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === confirmDialog.user!.id 
          ? { ...u, premium_status: confirmDialog.newStatus }
          : u
      ));

      toast({
        title: 'Success',
        description: `User ${confirmDialog.newStatus ? 'upgraded to' : 'downgraded from'} premium`,
      });
    } catch (err) {
      console.error('Error updating premium status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update premium status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(null);
      setConfirmDialog({ open: false, user: null, newStatus: false });
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Country', 'Premium', 'Blog Subscription', 'Email Notifications', 'Signup Date'];
    const csvData = filteredUsers.map(user => [
      user.first_name && user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.name || 'N/A',
      user.email,
      user.country || 'N/A',
      user.premium_status ? 'Yes' : 'No',
      user.blog_subscription ? 'Yes' : 'No',
      user.email_notifications ? 'Yes' : 'No',
      new Date(user.created_at).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: users.length,
    premium: users.filter(u => u.premium_status).length,
    free: users.filter(u => !u.premium_status).length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card 
          className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${filter === 'premium' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('premium')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Crown className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.premium}</p>
                <p className="text-sm text-muted-foreground">Premium Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${filter === 'free' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('free')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <UserCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.free}</p>
                <p className="text-sm text-muted-foreground">Free Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <Button onClick={exportToCSV} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
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
                  <TableHead>Premium</TableHead>
                  <TableHead>Signup Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}` 
                        : user.name || 'N/A'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.country || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.blog_subscription && (
                          <Badge variant="outline" className="text-xs">Blog</Badge>
                        )}
                        {user.email_notifications && (
                          <Badge variant="outline" className="text-xs">Email</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.premium_status}
                          onCheckedChange={() => handlePremiumToggle(user)}
                          disabled={updating === user.id}
                        />
                        {user.premium_status && (
                          <Crown className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filter !== 'all' ? 'No users match your criteria' : 'No users yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, user: null, newStatus: false })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.newStatus ? 'Upgrade to Premium?' : 'Remove Premium Status?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.newStatus 
                ? `This will grant premium access to ${confirmDialog.user?.email}. They will have access to all premium features.`
                : `This will remove premium access from ${confirmDialog.user?.email}. They will lose access to premium features.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPremiumChange}>
              {confirmDialog.newStatus ? 'Upgrade' : 'Remove Premium'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
