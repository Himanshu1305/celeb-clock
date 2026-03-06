import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Cake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBirthdayData, getCategoryIcon } from '@/data/birthdayData';

const fetchWikipediaImages = async (people: { name: string; wikipediaUrl?: string }[]) => {
  const titlesMap: Record<string, string> = {};
  
  for (const person of people) {
    if (person.wikipediaUrl) {
      const match = person.wikipediaUrl.match(/\/wiki\/(.+)$/);
      if (match) titlesMap[person.name] = decodeURIComponent(match[1]);
    } else {
      titlesMap[person.name] = person.name.replace(/ /g, '_');
    }
  }

  const titles = Object.values(titlesMap).join('|');
  if (!titles) return {};

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=pageimages&pithumbsize=100&format=json&origin=*`
    );
    const data = await response.json();
    const pages = data?.query?.pages || {};
    
    const imageMap: Record<string, string> = {};
    for (const [name, title] of Object.entries(titlesMap)) {
      for (const page of Object.values(pages) as any[]) {
        if (page.title === title.replace(/_/g, ' ') && page.thumbnail?.source) {
          imageMap[name] = page.thumbnail.source;
          break;
        }
      }
    }
    return imageMap;
  } catch {
    return {};
  }
};

export const TodaysBirthdays = () => {
  const navigate = useNavigate();
  const today = new Date();
  const data = getBirthdayData(today.getMonth() + 1, today.getDate());
  const people = data.people.slice(0, 8);
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (people.length > 0) {
      fetchWikipediaImages(people).then(setImages);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (people.length === 0) return null;

  return (
    <Card className="glass-card card-party-border">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl animate-wiggle inline-block">🎂</span>
            <h2 className="text-3xl font-bold gradient-text-primary">
              Born Today
            </h2>
          </div>
          <p className="text-muted-foreground">
            Famous people celebrating their birthday on {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person) => {
            const Icon = getCategoryIcon(person.category);
            const imageUrl = images[person.name];
            const wikiUrl = person.wikipediaUrl;
            
            return (
              <a
                key={person.name}
                href={wikiUrl || '#'}
                target={wikiUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group"
              >
                <Avatar className="w-10 h-10 shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                  {imageUrl ? (
                    <AvatarImage src={imageUrl} alt={person.name} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.profession}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
              </a>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="outline" className="gap-2 hover-scale" onClick={() => navigate('/todays-birthdays')}>
            See More Celebrity Birthdays
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
