import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Crown, Download, Loader2, Save, Shield, Trash2, User } from 'lucide-react';
import { countries } from '@/data/countries';

export default function Profile() {
  const { user, profile, loading, updateProfile, deleteAccount, isPremium } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    country: '',
    email_notifications: false,
    blog_subscription: true,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        country: profile.country || '',
        email_notifications: profile.email_notifications || false,
        blog_subscription: profile.blog_subscription ?? true,
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({
      first_name: formData.first_name,
      last_name: formData.last_name,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      country: formData.country,
      email_notifications: formData.email_notifications,
      blog_subscription: formData.blog_subscription,
    } as any);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleDownloadData = () => {
    if (!profile) return;
    const exportData = {
      name: profile.name,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      country: profile.country,
      premium_status: profile.premium_status,
      email_notifications: profile.email_notifications,
      blog_subscription: profile.blog_subscription,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    const { error } = await deleteAccount();
    setIsDeleting(false);
    if (!error) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-primary rounded-full animate-pulse animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse animation-delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Info */}
          <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Crown className={`h-6 w-6 ${isPremium ? 'text-accent' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">{isPremium ? 'Premium Member' : 'Free Account'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isPremium ? 'Enjoy all premium features' : 'Upgrade for more features'}
                      </p>
                    </div>
                  </div>
                  {isPremium ? (
                    <Badge variant="secondary" className="gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  ) : (
                    <Link to="/upgrade">
                      <Button size="sm" className="gap-2">
                        <Crown className="h-4 w-4" />
                        Upgrade
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Data Management */}
            <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Privacy & Data Management
                </CardTitle>
                <CardDescription>
                  Manage your subscriptions, download your data, or delete your account. You have full control over your data as per GDPR.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subscription Controls */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-foreground">Communication Preferences</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive account updates. You can opt out at any time.
                      </p>
                    </div>
                    <Switch
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, email_notifications: checked }));
                        if (!isEditing) {
                          updateProfile({ email_notifications: checked });
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Blog & Newsletter</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive blog posts and newsletter. You can unsubscribe at any time.
                      </p>
                    </div>
                    <Switch
                      checked={formData.blog_subscription}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ ...prev, blog_subscription: checked }));
                        if (!isEditing) {
                          updateProfile({ blog_subscription: checked } as any);
                        }
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Data Export */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Download Your Data</h4>
                  <p className="text-xs text-muted-foreground">
                    Export all personal data we store about you (name, email, preferences) as a JSON file. No health data is ever stored.
                  </p>
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleDownloadData}>
                    <Download className="h-4 w-4" />
                    Download My Data
                  </Button>
                </div>

                <Separator />

                {/* Delete Account */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-destructive">Delete Account</h4>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete My Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>This will permanently delete:</p>
                          <ul className="list-disc list-inside text-sm space-y-1">
                            <li>Your profile and account information</li>
                            <li>All reviews you've submitted</li>
                            <li>Your analytics and usage data</li>
                            <li>Your authentication credentials</li>
                          </ul>
                          <p className="font-medium text-destructive">This action cannot be undone.</p>
                          <div className="pt-2">
                            <Label htmlFor="deleteConfirm" className="text-sm">
                              Type <strong>DELETE</strong> to confirm:
                            </Label>
                            <Input
                              id="deleteConfirm"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder="Type DELETE"
                              className="mt-1"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancel</AlertDialogCancel>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                        >
                          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Permanently Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
