import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { FileText, AlertCircle, DollarSign, Copyright, Ban, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Terms() {
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
          <FileText className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read these terms carefully before using our app
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Introduction */}
        <Card className="mb-8 hover-scale transition-all">
          <CardContent className="pt-6 text-muted-foreground leading-relaxed">
            <p>
              Welcome to <strong className="text-foreground">Age & Celeb Life</strong>.
            </p>
            <p className="mt-3">
              By using our app, you agree to the following terms. If you do not agree, please do not use the app.
            </p>
          </CardContent>
        </Card>

        {/* Usage Rules */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              1. Usage Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The service is for personal, non-commercial use only.</li>
              <li>Do not misuse or reverse-engineer the app.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-accent" />
              2. Disclaimer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The life expectancy calculator is based on public health studies (WHO, CDC).</li>
              <li>It is not medical advice.</li>
              <li>No guarantee of accuracy.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-accent" />
              3. Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Premium access is a one-time $9.99 non-recurring fee.</li>
              <li>"Lifetime access" refers to the app's lifetime, including future updates.</li>
              <li>No refunds unless legally mandated.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Copyright className="w-6 h-6 text-accent" />
              4. Intellectual Property
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground leading-relaxed">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All content (design, code, infographics) belongs to Age & Celeb Life.</li>
              <li>You may not reproduce or distribute it without permission.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Ban className="w-6 h-6 text-accent" />
              5. Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>We reserve the right to suspend or terminate accounts for misuse.</p>
          </CardContent>
        </Card>

        {/* Agreement */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">6. Agreement</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>By upgrading or using the service, you agree to these Terms.</p>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8 hover-scale transition-all">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">7. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground leading-relaxed">
            <p>
              We are not liable for any direct, indirect, incidental, or consequential damages arising from use.
            </p>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <Footer />
    </div>
  );
}
