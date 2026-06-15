import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { WikiPerson } from '@/services/WikimediaService';

// ── helpers ──────────────────────────────────────────────────────────────────

function getZodiacSign(dob: Date): string {
  const month = dob.getMonth() + 1;
  const day = dob.getDate();
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '♈ Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '♉ Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '♊ Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '♋ Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '♌ Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '♍ Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '♎ Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '♏ Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '♐ Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '♑ Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '♒ Aquarius';
  return '♓ Pisces';
}

function getBirthstone(month: number): string {
  const stones: Record<number, string> = {
    1: '🔴 Garnet', 2: '💜 Amethyst',
    3: '🩵 Aquamarine', 4: '💎 Diamond',
    5: '💚 Emerald', 6: '🤍 Pearl',
    7: '❤️ Ruby', 8: '🟢 Peridot',
    9: '🔵 Sapphire', 10: '🌈 Opal',
    11: '🟡 Topaz', 12: '🩵 Turquoise',
  };
  return stones[month] || '💎 Diamond';
}

function getLifePath(dob: Date): number {
  const digits = `${String(dob.getDate()).padStart(2, '0')}${String(dob.getMonth() + 1).padStart(2, '0')}${dob.getFullYear()}`;
  let sum = digits.split('').reduce((a, b) => a + parseInt(b), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return sum;
}

function calcAge(birthDate: Date, refDate: Date): number {
  let age = refDate.getFullYear() - birthDate.getFullYear();
  const m = refDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && refDate.getDate() < birthDate.getDate())) age--;
  return age;
}

// ── component ─────────────────────────────────────────────────────────────────

export const CelebritySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [results, setResults] = useState<WikiPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setTimeout(async () => {
      try {
        const { searchCelebrities } = await import('@/data/birthdayData');
        const searchResults = searchCelebrities(searchQuery, category !== 'all' ? category : undefined);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);
  };

  const handleShare = (index: number, person: WikiPerson, birthDate: Date, zodiac: string, lifePath: number) => {
    const signName = zodiac.split(' ').slice(1).join(' ');
    const formattedDate = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const text = `Did you know ${person.name} was born on ${formattedDate}?\nTheir zodiac sign is ${signName} and life path is ${lifePath}!\nFind your own birthday profile at bornclock.com\n#BornClock #${signName.replace(' ', '')} #Birthday`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const today = new Date();

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-accent/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-accent" />
          Search Celebrities &amp; Notable People
        </CardTitle>
        <CardDescription>
          Find famous people by name, profession, or category
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or profession..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="actor">Actors</SelectItem>
              <SelectItem value="celebrity">Celebrities</SelectItem>
              <SelectItem value="dancer">Dancers</SelectItem>
              <SelectItem value="artist">Artists</SelectItem>
              <SelectItem value="scientist">Scientists</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneurs</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid gap-3 max-h-[600px] overflow-y-auto">
              {results.map((person, index) => {
                const birthDate = new Date(person.birthDate + 'T00:00:00');
                const isDeceased = !!person.deathDate;
                let ageDisplay: string;
                if (isDeceased && person.deathDate) {
                  const deathDate = new Date(person.deathDate + 'T00:00:00');
                  ageDisplay = `Died age ${calcAge(birthDate, deathDate)}`;
                } else {
                  ageDisplay = `Age ${calcAge(birthDate, today)}`;
                }
                const zodiac = getZodiacSign(birthDate);
                const birthstone = getBirthstone(birthDate.getMonth() + 1);
                const lifePath = getLifePath(birthDate);
                const dobForUrl = person.birthDate;
                const initials = person.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const formattedDOB = birthDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-card rounded-2xl border shadow-sm p-4 flex gap-4 items-start"
                  >
                    {/* Photo */}
                    <Avatar className="w-20 h-20 rounded-full border-2 border-border/50 shrink-0">
                      <AvatarImage
                        src={person.image}
                        alt={person.name}
                        className="object-cover object-top"
                      />
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/20 to-accent/20 rounded-full">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg leading-tight text-foreground">{person.name}</h4>
                      <p className="text-sm text-muted-foreground">{formattedDOB}</p>
                      <p className="text-sm text-muted-foreground">{ageDisplay}</p>

                      {/* Quick facts */}
                      <div className="flex flex-wrap gap-3 text-sm mt-2 text-muted-foreground">
                        <span>{zodiac}</span>
                        <span>{birthstone}</span>
                        <span>🔢 Life Path {lifePath}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Link
                          to={`/?dob=${dobForUrl}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          🌟 View Birthday Profile
                        </Link>
                        <button
                          onClick={() => handleShare(index, person, birthDate, zodiac, lifePath)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-muted text-gray-700 dark:text-muted-foreground text-xs font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-muted/80 transition-colors"
                        >
                          {copiedIndex === index ? '✓ Copied!' : '📤 Share'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!isSearching && searchQuery && results.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No results found for "{searchQuery}"</p>
            <p className="text-sm">Try a different search term or category</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
