import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signUp, signIn } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic flex flex-col items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-primary rounded-full animate-pulse animation-delay-300"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-accent rounded-full animate-pulse animation-delay-700"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative z-10">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calculator
        </Link>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
            Cosmic Age
          </h1>
        </div>
        <p className="text-muted-foreground">
          {isSignUp ? 'Create your account to unlock premium features' : 'Welcome back to your cosmic journey'}
        </p>
      </div>

      {/* Auth Form */}
      <Card className="w-full max-w-md backdrop-blur-sm bg-background/80 border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Join thousands exploring their cosmic age'
              : 'Continue your journey through time'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading 
                ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Premium Features Preview */}
      <Card className="w-full max-w-md mt-6 backdrop-blur-sm bg-background/50 border-accent/30">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-center mb-4 text-accent">Premium Features</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>1,000+ Celebrity Birthday Matches</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Life Expectancy Calculator</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Export Reports as PDF/Image</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-accent" />
              <span>Birthday Twin Email Notifications</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            One-time payment • $9.99 lifetime access
          </p>
        </CardContent>
      </Card>
    </div>
  );
}