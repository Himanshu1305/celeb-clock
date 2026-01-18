import { useState } from 'react';
import { Link } from 'react-router-dom';
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

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you within 48 hours.",
      });
      setName('');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
    }, 1000);
  };

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
          <MessageCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Contact Us
          </h1>
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
                  href="mailto:support@ageceleblife.com" 
                  className="text-accent hover:underline transition-colors"
                >
                  support@ageceleblife.com
                </a>
                <p className="text-sm text-muted-foreground mt-1">
                  We aim to respond within 48 hours.
                </p>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-foreground mb-2">Privacy Requests</h3>
                <p className="text-sm text-muted-foreground">
                  For data access or deletion requests, email us with your details. See our{' '}
                  <Link to="/privacy" className="text-accent hover:underline">
                    Privacy Policy
                  </Link>
                  {' '}for more.
                </p>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Thank you for using <strong className="text-foreground">Age & Celeb Life</strong>!
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

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
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
