import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';

export const AuthorBio = () => {
  return (
    <section className="max-w-3xl mx-auto mb-12">
      <Card className="glass-card">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl shrink-0">
            ✍️
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Celeb Clock Editorial Team</h3>
              <BadgeCheck className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our editorial team builds and reviews every calculator using verified data from WHO, CDC, NASA, and Wikipedia. We follow Google’s E-E-A-T principles — Experience, Expertise, Authoritativeness, Trustworthiness — to ensure accuracy and transparency.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <Link to="/about" className="text-primary hover:underline">About the team</Link>
              <Link to="/methodology" className="text-primary hover:underline">Methodology</Link>
              <Link to="/editorial-policy" className="text-primary hover:underline">Editorial policy</Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
