import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Shield, Lock, Eye, UserX } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy is our highest priority
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Our Commitment */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              Our Commitment to Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              Your privacy is our highest priority. This policy explains what information we collect, how we use it, and how we protect it.
            </p>
          </CardContent>
        </Card>

        {/* What Data We Collect */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Eye className="w-6 h-6 text-accent" />
              What Data We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>When you create an account, we collect:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name</li>
              <li>Email Address</li>
            </ul>
            <p className="pt-4">
              For functional purposes, when you use our tools, the following data is entered by you but is <strong className="text-foreground">never stored</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Date of Birth</li>
              <li>Gender</li>
              <li>Smoking and Drinking Habits</li>
              <li>Health History (Heart Disease, Diabetes)</li>
              <li>Exercise, Diet, and Stress Habits</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Your Data */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your Name and Email are stored securely to manage your account and track your premium access.</li>
              <li>All calculations (age, life expectancy) are processed temporarily on your device (client-side) or through anonymized APIs.</li>
              <li>Birthdate and health data are never stored on our servers.</li>
              <li>We may send optional birthday twin notifications or other informational emails with your consent.</li>
              <li>We use anonymized analytics for product improvements only.</li>
              <li>We do not use your information for marketing or ad targeting.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Lock className="w-6 h-6 text-accent" />
              Payments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Payments are securely processed via Stripe.</li>
              <li>We do not store your card information.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Sharing */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Data Sharing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We do not sell or share your Name or Email with third parties.</li>
              <li>Google AdSense may use cookies for ad personalization.</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <UserX className="w-6 h-6 text-accent" />
              User Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              You may request account deletion by contacting{' '}
              <a href="mailto:support@ageceleblife.com" className="text-accent hover:underline">
                support@ageceleblife.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All pages are HTTPS encrypted.</li>
              <li>Payment flows use Stripe's secure infrastructure.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates and Disclaimer */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover-scale transition-all">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>We may update this policy for clarity or compliance. The latest version will always be on this page.</p>
            </CardContent>
          </Card>

          <Card className="hover-scale transition-all">
            <CardHeader>
              <CardTitle className="font-heading text-xl">Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>Our tool is informational only and not medical advice.</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <Footer />
    </div>
  );
}
