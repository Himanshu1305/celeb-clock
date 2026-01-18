import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { WikimediaService, WikiPerson, WikiEvent } from '@/services/WikimediaService';
import { CelebrityProfileDialog } from '@/components/CelebrityProfileDialog';
import { calculateAgeInTimezone, detectUserTimezone } from '@/utils/timezoneDetection';
import { StarIcon, CakeIcon, FlaskConical, Briefcase, Trophy, Calendar, ExternalLink, Loader2, UsersIcon, Music, Palette } from 'lucide-react';

interface WikiBirthdayMatchesProps {
  birthDate: Date | null;
  onCelebritiesChange?: (celebrities: any[]) => void;
}

const PersonCard = ({ person, onClick }: { person: WikiPerson; onClick: () => void }) => {
  const age = person.deathDate ? null : calculateAgeInTimezone(new Date(person.birthDate));

  const getCategoryIcon = () => {
    switch (person.category) {
      case 'celebrity': return <StarIcon className="h-5 w-5" />;
      case 'actor': return <StarIcon className="h-5 w-5" />;
      case 'dancer': return <Music className="h-5 w-5" />;
      case 'artist': return <Palette className="h-5 w-5" />;
      case 'internet_celebrity': return <UsersIcon className="h-5 w-5" />;
      case 'scientist': return <FlaskConical className="h-5 w-5" />;
      case 'entrepreneur': return <Briefcase className="h-5 w-5" />;
      case 'sports':
      case 'athlete': return <Trophy className="h-5 w-5" />;
      default: return <StarIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = () => {
    switch (person.category) {
      case 'celebrity':
      case 'actor': return 'text-primary';
      case 'dancer': return 'text-purple-500';
      case 'artist': return 'text-pink-500';
      case 'internet_celebrity': return 'text-cyan-500';
      case 'scientist': return 'text-blue-500';
      case 'entrepreneur': return 'text-green-500';
      case 'sports':
      case 'athlete': return 'text-orange-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className="glass-card p-4 animate-fade-in-up hover:glow-primary transition-all duration-300 hover-scale cursor-pointer"
      onClick={onClick}
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-primary/30">
            <AvatarImage 
              src={person.image} 
              alt={person.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
              {person.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-sm leading-tight">{person.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {person.profession}
            </Badge>
            {age && (
              <p className="text-xs text-muted-foreground mt-1">
                Age: {age.years} years
              </p>
            )}
          </div>
          <div className={`${getCategoryColor()}`}>
            {getCategoryIcon()}
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Born: {new Date(person.birthDate).getFullYear()}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
};

const EventCard = ({ event }: { event: WikiEvent }) => (
  <Card className="glass-card p-4 animate-fade-in-up hover:glow-secondary transition-all duration-300 hover-scale">
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="text-secondary">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-sm leading-tight">{event.title}</h3>
          <Badge variant="outline" className="mt-1 text-xs">
            {event.year}
          </Badge>
        </div>
        {event.wikipediaUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2"
            onClick={() => window.open(event.wikipediaUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {event.description && (
        <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
          {event.description}
        </p>
      )}
    </div>
  </Card>
);

export const WikiBirthdayMatches = ({ birthDate, onCelebritiesChange }: WikiBirthdayMatchesProps) => {
  const [people, setPeople] = useState<WikiPerson[]>([]);
  const [events, setEvents] = useState<WikiEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<WikiPerson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const timezoneInfo = detectUserTimezone();

  useEffect(() => {
    if (!birthDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [peopleData, eventsData] = await Promise.all([
          WikimediaService.getPeopleByBirthDate(birthDate),
          WikimediaService.getHistoricalEvents(birthDate)
        ]);
        
        // Use setTimeout to prevent flickering by batching state updates
        setTimeout(() => {
          setPeople(peopleData);
          setEvents(eventsData);
          
          // Call the callback with the people data
          if (onCelebritiesChange) {
            onCelebritiesChange(peopleData);
          }
          setLoading(false);
        }, 0);
      } catch (err) {
        setError('Failed to fetch birthday matches. Please try again.');
        console.error('Error fetching birthday data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [birthDate, onCelebritiesChange]);

  if (!birthDate) return null;

  const groupedPeople = people.reduce((acc, person) => {
    if (!acc[person.category]) acc[person.category] = [];
    acc[person.category].push(person);
    return acc;
  }, {} as Record<string, WikiPerson[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CakeIcon className="h-8 w-8 text-secondary animate-pulse-glow" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text-secondary">
            Birthday Matches
          </h2>
          <p className="text-lg text-muted-foreground">
            Discovering famous people and events that share your special day
          </p>
        </div>

        <Card className="glass-card p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Searching through history...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="glass-card p-8 text-center">
        <div className="space-y-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold">Error Loading Data</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Card>
    );
  }

  const totalMatches = people.length + events.length;

  return (
    <>
      <CelebrityProfileDialog 
        person={selectedPerson}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
      
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CakeIcon className="h-8 w-8 text-secondary animate-pulse-glow" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text-secondary">
            Birthday Matches
          </h2>
          <p className="text-lg text-muted-foreground">
            Famous people and historical events that share your special day
          </p>
          <p className="text-sm text-muted-foreground">
            Calculated in your timezone: {timezoneInfo.timezone} (UTC{timezoneInfo.offset})
          </p>
        </div>

      {totalMatches > 0 ? (
        <>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-secondary text-secondary-foreground px-6 py-3 rounded-full text-lg font-semibold glow-secondary">
              🎉 {totalMatches} Match{totalMatches > 1 ? 'es' : ''} Found!
            </div>
          </div>

          <Tabs defaultValue="people" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="people" className="flex items-center gap-2">
                <StarIcon className="h-4 w-4" />
                Famous People ({people.length})
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Historical Events ({events.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="people" className="space-y-6">
              {Object.entries(groupedPeople).map(([category, categoryPeople]) => {
                const getCategoryDisplay = () => {
                  switch (category) {
                    case 'celebrity': return { icon: <StarIcon className="h-5 w-5 text-primary" />, label: 'Celebrities' };
                    case 'actor': return { icon: <StarIcon className="h-5 w-5 text-primary" />, label: 'Actors' };
                    case 'dancer': return { icon: <Music className="h-5 w-5 text-purple-500" />, label: 'Dancers' };
                    case 'artist': return { icon: <Palette className="h-5 w-5 text-pink-500" />, label: 'Artists' };
                    case 'internet_celebrity': return { icon: <UsersIcon className="h-5 w-5 text-cyan-500" />, label: 'Internet Celebrities' };
                    case 'scientist': return { icon: <FlaskConical className="h-5 w-5 text-blue-500" />, label: 'Scientists' };
                    case 'entrepreneur': return { icon: <Briefcase className="h-5 w-5 text-green-500" />, label: 'Entrepreneurs' };
                    case 'sports':
                    case 'athlete': return { icon: <Trophy className="h-5 w-5 text-orange-500" />, label: 'Sports Persons' };
                    default: return { icon: <StarIcon className="h-5 w-5" />, label: category };
                  }
                };
                
                const display = getCategoryDisplay();
                
                return (
                  <div key={category} className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      {display.icon}
                      {display.label} ({categoryPeople.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryPeople.map((person, index) => (
                        <PersonCard 
                          key={`${person.name}-${index}`} 
                          person={person}
                          onClick={() => {
                            setSelectedPerson(person);
                            setDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event, index) => (
                  <EventCard key={`${event.title}-${index}`} event={event} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card className="glass-card p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl mb-4">🎂</div>
            <h3 className="text-xl font-semibold">No Matches Found</h3>
            <p className="text-muted-foreground">
              We couldn't find any famous people or historical events that share your birthday. 
              Your special day is truly unique!
            </p>
          </div>
        </Card>
      )}
      </div>
    </>
  );
};