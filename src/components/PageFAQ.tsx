import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle } from 'lucide-react';
import { pageFaqs, type FAQ } from '@/data/pageFaqs';

interface PageFAQProps {
  slug: keyof typeof pageFaqs;
  title?: string;
  items?: FAQ[];
}

export const PageFAQ = ({ slug, title = 'Frequently Asked Questions', items }: PageFAQProps) => {
  const faqs = items ?? pageFaqs[slug];
  if (!faqs || faqs.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  return (
    <section className="max-w-3xl mx-auto mb-16">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="text-center mb-6 flex items-center justify-center gap-2">
        <HelpCircle className="w-6 h-6 text-accent" />
        <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary">{title}</h2>
      </div>
      <Card className="glass-card">
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-medium text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
};
