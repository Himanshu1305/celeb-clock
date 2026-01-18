import { useState, useEffect } from 'react';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WikiBirthdayMatches } from '@/components/WikiBirthdayMatches';
import { ZodiacAndFacts } from '@/components/ZodiacAndFacts';
import { CelebritySearch } from '@/components/CelebritySearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { ArrowRight, Star, Users, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useBirthDate } from '@/context/BirthDateContext';

const CelebrityBirthday = () => {
  const { birthDate: sharedBirthDate, setBirthDate: setSharedBirthDate } = useBirthDate();
  const [birthDate, setBirthDate] = useState<Date | null>(sharedBirthDate);
  const [celebrities, setCelebrities] = useState<any[]>([]);

  // Sync with shared context
  useEffect(() => {
    if (sharedBirthDate && !birthDate) {
      setBirthDate(sharedBirthDate);
    }
  }, [sharedBirthDate]);

  const handleDateSelect = (date: Date | undefined) => {
    const newDate = date || null;
    setBirthDate(newDate);
    setSharedBirthDate(newDate);
  };

  const handleCelebritiesChange = (newCelebrities: any[]) => {
    setCelebrities(newCelebrities);
  };

  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Navigation */}
        <header className="flex justify-between items-center mb-12">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <section className="text-center space-y-6 pt-8 pb-12 max-w-4xl mx-auto">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text-primary leading-tight">
              Find Out Which Celebrities Share Your Birthday — Celebrate Like the Stars!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Enter your birth date and instantly discover which celebrities were born on the same day as you. Our Celebrity Birthday Match connects your special day with the stars who share it — complete with photos, bios, and fun facts.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="gap-2 text-lg px-8 py-6 animate-glow"
                onClick={() => document.getElementById('birthday-picker')?.scrollIntoView({ behavior: 'smooth' })}
              >
                🎈 Find My Celebrity Match
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Birthday Picker Section */}
        <section id="birthday-picker" className="max-w-2xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">Select Your Birth Date</h2>
                <p className="text-muted-foreground">Choose your birthday to find your celebrity twins</p>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={birthDate || undefined}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  disabled={(date) => date > new Date()}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Birthday Matches Section */}
        {birthDate && (
          <>
            <div className="flex items-center justify-center mb-12">
              <Separator className="w-full max-w-md bg-gradient-primary h-0.5 border-0" />
            </div>
            
            <section className="mb-16">
              <WikiBirthdayMatches birthDate={birthDate} onCelebritiesChange={handleCelebritiesChange} />
            </section>

            {/* Zodiac and Fun Facts Section */}
            <div className="flex items-center justify-center mb-12">
              <Separator className="w-full max-w-md bg-gradient-primary h-0.5 border-0" />
            </div>
            
            <section className="mb-16">
              <ZodiacAndFacts birthDate={birthDate} />
            </section>
          </>
        )}

        {/* Celebrity Search Section */}
        <div className="flex items-center justify-center mb-12">
          <Separator className="w-full max-w-md bg-gradient-primary h-0.5 border-0" />
        </div>
        
        <section className="mb-16">
          <CelebritySearch />
        </section>

        {/* About Section */}
        <section className="max-w-4xl mx-auto mb-16">
          <Card className="glass-card">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-3xl font-bold gradient-text-primary text-center mb-6">
                Share Your Day with the Stars — Discover Your Celebrity Birthday Twins
              </h2>
              
              <div className="prose prose-lg max-w-none text-foreground space-y-4">
                <p>
                  Every birthday tells a story — yours might just be shared with someone extraordinary. With our Celebrity Birthday Match, you'll uncover which famous personalities were born on the same day as you. From world-renowned actors and musicians to inspiring leaders and athletes, discover who celebrates alongside you.
                </p>
                
                <p>
                  Simply enter your date of birth, and the tool instantly searches verified databases to find celebrities who share your birthday. On the results page, you'll see a beautiful grid or carousel showcasing:
                </p>
                
                <div className="bg-primary/5 rounded-lg p-6 my-6">
                  <ul className="space-y-3 list-none">
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span><strong>👑 Celebrity Name & Photo</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span><strong>🎂 Date of Birth & Current Age</strong> (auto-calculated)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <span><strong>✨ Short Bio</strong> and a link to their profile page</span>
                    </li>
                  </ul>
                </div>
                
                <p>
                  Each celebrity card is presented in a clean, elegant layout designed for both mobile and desktop experiences — making it easy to scroll, explore, and share.
                </p>
                
                <p>
                  In line with EEAT (Experience, Expertise, Authoritativeness, and Trustworthiness) standards, all data is compiled from verified public sources such as IMDb, Wikipedia, and official celebrity databases. This ensures accuracy, transparency, and credibility in every match.
                </p>
                
                <div className="bg-secondary/10 rounded-lg p-6 my-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Fun Facts About Your Birthday Month
                  </h3>
                  <p className="mb-3">But that's not all — we make your experience more meaningful by showing:</p>
                  <ul className="space-y-2 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🌟</span>
                      <span>Historical events that happened during your birth month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🎉</span>
                      <span>Famous festivals or cultural moments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🏆</span>
                      <span>Notable celebrity birthdays in the same month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📅</span>
                      <span>Memorable world records or achievements</span>
                    </li>
                  </ul>
                </div>
                
                <p>
                  Whether you're posting your results on social media, comparing zodiac signs, or simply curious, the Celebrity Birthday Match turns your date of birth into a fascinating snapshot of fame and history.
                </p>
                
                <p className="text-center pt-4 text-muted-foreground">
                  📧 For questions or feedback, write to <a href="/contact" className="text-primary hover:underline">support@yourdomain.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CelebrityBirthday;
