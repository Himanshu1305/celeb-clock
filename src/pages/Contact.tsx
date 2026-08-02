import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Send, MessageCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import PageTagline from '@/components/PageTagline';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState('general');
  const [website, setWebsite] = useState(''); // honeypot — real users leave this empty
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorField, setErrorField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorField(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorField(!name.trim() ? 'name' : !email.trim() ? 'email' : 'message');
      toast({ title: 'Missing information', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorField('email');
      toast({ title: 'Invalid email', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, topic, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSubmitted(true);
        setName(''); setEmail(''); setMessage(''); setTopic('general');
      } else {
        if (data.field) setErrorField(data.field);
        toast({ title: 'Could not send', description: data.error || 'Please try again, or email hello@bornclock.com directly.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Could not send', description: 'Please try again, or email hello@bornclock.com directly.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact BornClock — Get in Touch"
        description="Reach out to the BornClock team with questions, feedback, or partnership ideas. We're here to help with any birthday insights or calculator questions."
        canonicalUrl="/contact"
        ogType="website"
      />
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <MessageCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2 text-foreground">
            Contact Us
          </h1>
          <PageTagline />
          <p className="text-sm text-muted-foreground mb-3">Your Birthday Intelligence Platform</p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We'd love to hear from you
          </p>
        </div>

        <Separator className="mb-12" />

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Contact Info */}
          <Card className="hover-scale transition-all">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Mail className="w-6 h-6 text-accent" />
                Get in Touch
              </CardTitle>
              <CardDescription>
                Whether you have questions, feedback, or need support, feel free to reach out.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-heading font-semibold text-foreground mb-2">Email Us</h3>
                <a
                  href="mailto:hello@bornclock.com"
                  className="text-accent hover:underline transition-colors"
                >
                  hello@bornclock.com
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  We typically respond within 24 hours.
                </p>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-foreground mb-2">Privacy Requests</h3>
                <p className="text-sm text-muted-foreground">
                  For data access or deletion requests, email{' '}
                  <a href="mailto:privacy@bornclock.com" className="text-accent hover:underline">
                    privacy@bornclock.com
                  </a>
                  . See our{' '}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}for more.
                </p>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-foreground mb-2">Press Enquiries</h3>
                <p className="text-sm text-muted-foreground">
                  For media and press queries, email{' '}
                  <a href="mailto:press@bornclock.com" className="text-accent hover:underline">
                    press@bornclock.com
                  </a>
                  .
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Thank you for using <strong className="text-foreground">BornClock</strong>!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card className="hover-scale transition-all">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Send className="w-6 h-6 text-accent" />
                Send Us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-6" data-testid="contact-success">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-semibold text-foreground mb-1">Thanks — your message is on its way.</p>
                  <p className="text-sm text-muted-foreground">We typically reply within 24 hours, at the email you gave us.</p>
                </div>
              ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={errorField === 'name'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={errorField === 'email'}
                  />
                  {errorField === 'email' && <p className="text-sm text-rose-600" role="alert">Please enter a valid email address.</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <select
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="general">General enquiry</option>
                    <option value="support">Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="privacy">Privacy / data request</option>
                    <option value="correction">Editorial correction</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    aria-invalid={errorField === 'message'}
                  />
                </div>

                {/* Honeypot — hidden from real users; bots that fill it are silently dropped. */}
                <input
                  type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                  value={website} onChange={(e) => setWebsite(e.target.value)}
                  name="website" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                />

                <Button
                  type="submit"
                  className="w-full font-heading"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
