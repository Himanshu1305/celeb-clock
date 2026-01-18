import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Star, ExternalLink, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumCelebrity {
  id: string;
  name: string;
  birthDate: string;
  profession: string;
  image?: string;
  bio?: string;
  website?: string;
  instagram?: string;
  twitter?: string;
  achievements?: string[];
  netWorth?: string;
  nationality?: string;
  age?: number;
}

interface Props {
  birthDate?: Date | null;
  onCelebritiesChange?: (celebrities: PremiumCelebrity[]) => void;
}

export const PremiumCelebrityMatch = ({ birthDate, onCelebritiesChange }: Props) => {
  const { isPremium } = useAuth();
  const [matches, setMatches] = useState<PremiumCelebrity[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Notify parent component of celebrity matches
  useEffect(() => {
    if (onCelebritiesChange) {
      onCelebritiesChange(matches);
    }
  }, [matches, onCelebritiesChange]);

  // Mock premium celebrity database
  const premiumCelebrities: PremiumCelebrity[] = [
    {
      id: '1',
      name: 'Leonardo DiCaprio',
      birthDate: '1974-11-11',
      profession: 'Actor & Environmental Activist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      bio: 'Academy Award-winning actor known for his environmental activism and iconic roles in films like Titanic, The Revenant, and Inception.',
      website: 'https://leonardodicaprio.org',
      achievements: ['Academy Award Winner', 'Golden Globe Winner', 'Environmental Activist'],
      netWorth: '$260 million',
      nationality: 'American',
      age: 50
    },
    {
      id: '2', 
      name: 'Demi Moore',
      birthDate: '1962-11-11',
      profession: 'Actress & Producer',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150&h=150&fit=crop&crop=face',
      bio: 'Actress and producer known for her roles in Ghost, A Few Good Men, and Indecent Proposal.',
      achievements: ['Golden Globe Nominee', 'Producer', 'Author'],
      netWorth: '$200 million',
      nationality: 'American',
      age: 62
    },
    {
      id: '3',
      name: 'Stanley Tucci',
      birthDate: '1960-11-11', 
      profession: 'Actor & Director',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      bio: 'Emmy-winning actor known for his roles in The Devil Wears Prada, The Hunger Games, and his cooking shows.',
      achievements: ['Emmy Winner', 'Golden Globe Nominee', 'Cookbook Author'],
      nationality: 'American',
      age: 64
    }
  ];

  useEffect(() => {
    if (birthDate && isPremium) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();
        
        const foundMatches = premiumCelebrities.filter(celebrity => {
          const celeBirthDate = new Date(celebrity.birthDate);
          const celebMonth = celeBirthDate.getMonth() + 1;
          const celebDay = celeBirthDate.getDate();
          
          return celebMonth === month && celebDay === day;
        });
        
        setMatches(foundMatches);
        setLoading(false);
      }, 1000);
    }
  }, [birthDate, isPremium]);

  if (!isPremium) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border-accent/30">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-6 h-6 text-accent" />
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              Premium Feature
            </Badge>
          </div>
          <CardTitle className="text-2xl">Premium Celebrity Database</CardTitle>
          <CardDescription>
            Unlock 1,000+ celebrity profiles with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>1,000+ Celebrities</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Detailed Profiles</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Birth Information</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>Social Links</span>
            </div>
          </div>
          <Link to="/upgrade">
            <Button className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (!birthDate) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
        <CardContent className="text-center py-8">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Enter your birth date above to find premium celebrity matches
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" />
            Premium Celebrity Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Finding your celebrity matches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-background/80 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Premium Celebrity Matches
            </CardTitle>
            <CardDescription>
              {matches.length} premium matches found for your birthday
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {matches.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No premium celebrity matches found for your birthday.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Our database includes over 1,000 celebrities - try a different date!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((celebrity) => (
              <Card key={celebrity.id} className="bg-primary/5 border-primary/20 hover-scale transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="w-20 h-20 border-2 border-primary/30">
                        <AvatarImage 
                          src={celebrity.image} 
                          alt={celebrity.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-lg bg-primary/20 text-primary">
                          {celebrity.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold">{celebrity.name}</h3>
                        <p className="text-sm text-muted-foreground">{celebrity.profession}</p>
                        {celebrity.nationality && (
                          <p className="text-xs text-muted-foreground">{celebrity.nationality}</p>
                        )}
                      </div>
                      
                      {celebrity.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {celebrity.bio}
                        </p>
                      )}
                      
                      {celebrity.achievements && (
                        <div className="flex flex-wrap gap-1">
                          {celebrity.achievements.map((achievement, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {celebrity.age && (
                          <span>Age: {celebrity.age}</span>
                        )}
                        {celebrity.netWorth && (
                          <span>Net Worth: {celebrity.netWorth}</span>
                        )}
                      </div>
                      
                      {celebrity.website && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <a href={celebrity.website} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Website
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Data from our premium celebrity database</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};