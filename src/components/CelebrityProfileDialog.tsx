import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WikiPerson } from '@/services/WikimediaService';
import { calculateAgeInTimezone } from '@/utils/timezoneDetection';
import { 
  ExternalLink, 
  Calendar, 
  CakeIcon, 
  StarIcon,
  FlaskConical,
  Briefcase,
  Trophy,
  UsersIcon,
  Music,
  Palette
} from 'lucide-react';

interface CelebrityProfileDialogProps {
  person: WikiPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CelebrityProfileDialog = ({ 
  person, 
  open, 
  onOpenChange 
}: CelebrityProfileDialogProps) => {
  if (!person) return null;

  const age = person.deathDate 
    ? null 
    : calculateAgeInTimezone(new Date(person.birthDate));

  const getCategoryIcon = () => {
    switch (person.category) {
      case 'celebrity': return <StarIcon className="h-5 w-5" />;
      case 'actor': return <StarIcon className="h-5 w-5" />;
      case 'dancer': return <Music className="h-5 w-5" />;
      case 'artist': return <Palette className="h-5 w-5" />;
      case 'internet_celebrity': return <UsersIcon className="h-5 w-5" />;
      case 'scientist': return <FlaskConical className="h-5 w-5" />;
      case 'entrepreneur': return <Briefcase className="h-5 w-5" />;
      case 'athlete': 
      case 'sports': return <Trophy className="h-5 w-5" />;
      default: return <StarIcon className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = () => {
    switch (person.category) {
      case 'internet_celebrity': return 'Internet Celebrity';
      case 'sports': return 'Sports Person';
      default: return person.category.charAt(0).toUpperCase() + person.category.slice(1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Celebrity Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg">
              <AvatarImage 
                src={person.image} 
                alt={person.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-3xl font-bold">
                {person.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-3xl font-bold gradient-text-primary mb-2">
                  {person.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getCategoryIcon()}
                    {getCategoryLabel()}
                  </Badge>
                  <Badge variant="outline">
                    {person.profession}
                  </Badge>
                </div>
              </div>

              {person.wikipediaUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(person.wikipediaUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Wikipedia
                </Button>
              )}
            </div>
          </div>

          {/* Age and Birthday Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Birth Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(person.birthDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="text-secondary">
                  <CakeIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {person.deathDate ? 'Lived' : 'Current Age'}
                  </p>
                  <p className="text-lg font-semibold">
                    {age ? (
                      <>
                        {age.years} years
                        {age.months > 0 && `, ${age.months} months`}
                      </>
                    ) : (
                      person.deathDate ? (
                        <>
                          {new Date(person.deathDate).getFullYear() - new Date(person.birthDate).getFullYear()} years
                          <span className="text-sm text-muted-foreground ml-2">
                            (deceased)
                          </span>
                        </>
                      ) : 'N/A'
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Description */}
          {person.description && (
            <Card className="glass-card p-4">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed">
                {person.description}
              </p>
            </Card>
          )}

          {/* Fun Fact */}
          {person.funFact && (
            <Card className="glass-card p-4 bg-gradient-secondary/10">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <StarIcon className="h-4 w-4 text-secondary" />
                Fun Fact
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {person.funFact}
              </p>
            </Card>
          )}

          {/* Client-side Calculation Note */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            Age calculated client-side in your browser using your local timezone
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
