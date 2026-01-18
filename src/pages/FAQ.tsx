import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { HelpCircle, Heart, Users, DollarSign, FileDown, UserPlus, Lock, AlertCircle, Bell, Crown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    icon: Heart,
    question: "How is my life expectancy calculated?",
    answer: "We use simplified actuarial models based on publicly available health studies from reputable sources like WHO and CDC. Each factor (smoking, drinking, family medical history, stress) is assigned a weighted value that impacts your estimated life expectancy compared to national averages. Estimates are informational, not medical advice."
  },
  {
    icon: Users,
    question: "How are celebrity birthdays matched?",
    answer: "We use a database of 1,000+ celebrities (sourced from public data) to find those sharing your birthday (day and month)."
  },
  {
    icon: DollarSign,
    question: "What does the $9.99 fee cover?",
    answer: "For a one-time $9.99 fee, you get lifetime access to: Full life expectancy calculator (all health inputs), Exportable PDF or shareable image of your report, Unlimited celebrity birthday matching, Ad-free experience, \"What-If\" slider to see the effect of lifestyle changes, and Lifetime access to future updates."
  },
  {
    icon: FileDown,
    question: "Can I export my age report?",
    answer: "Yes, Premium users can export their personalized infographic report as a PDF or shareable image."
  },
  {
    icon: UserPlus,
    question: "Do I need an account?",
    answer: "Free features don't require one. Premium users create a secure account (Name, Email) during purchase for lifetime access and notifications. You can delete it anytime."
  },
  {
    icon: Lock,
    question: "Is my personal information stored?",
    answer: "We store only your Name and Email for account management. DOB and health data are never stored."
  },
  {
    icon: AlertCircle,
    question: "Is the life expectancy tool medical advice?",
    answer: "No, it is purely for informational and entertainment purposes. We recommend consulting a healthcare professional for advice regarding your health."
  },
  {
    icon: Bell,
    question: "Can I get birthday twin notifications?",
    answer: "Yes, premium users opt-in during signup for emails about new matches or reminders (unsubscribe anytime)."
  },
  {
    icon: Crown,
    question: "How can I upgrade to premium?",
    answer: "After using the free tools, simply click \"Upgrade to Premium\" and complete a secure one-time payment via Stripe."
  },
  {
    icon: FileDown,
    question: "How do I export my report?",
    answer: "After generating your full Life Report in the premium version, you will see a button to export it as a shareable image or PDF."
  }
];

export default function FAQ() {
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
          <HelpCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Age & Celeb Life
          </p>
        </div>

        <Separator className="mb-12" />

        {/* FAQ Accordion */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => {
                const Icon = faq.icon;
                return (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <span className="font-heading font-medium text-foreground">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-8 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-primary text-primary-foreground text-center">
          <CardHeader>
            <CardTitle className="font-heading text-2xl">Still have questions?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We're here to help! Reach out to us and we'll get back to you within 48 hours.
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="font-heading">
                Contact Us
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
