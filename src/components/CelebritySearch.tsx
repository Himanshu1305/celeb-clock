import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getCategoryIcon } from '@/data/birthdayData';
import { calculateAgeInTimezone } from '@/utils/timezoneDetection';
import { CelebrityProfileDialog } from './CelebrityProfileDialog';
import type { WikiPerson } from '@/services/WikimediaService';

export const CelebritySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [results, setResults] = useState<WikiPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<WikiPerson | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate search with timeout
    setTimeout(async () => {
      try {
        // Import static data for fallback search
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

  const handlePersonClick = (person: WikiPerson) => {
    setSelectedPerson(person);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="backdrop-blur-sm bg-background/80 border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-accent" />
            Search Celebrities & Notable People
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
              <div className="grid gap-3 max-h-[500px] overflow-y-auto">
                {results.map((person, index) => {
                  const IconComponent = getCategoryIcon(person.category);
                  const birthDate = new Date(person.birthDate);
                  const ageData = calculateAgeInTimezone(birthDate);
                  const age = ageData.years;
                  const isDeceased = person.deathDate !== undefined;
                  
                  return (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-md"
                      onClick={() => handlePersonClick(person)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={person.image} alt={person.name} />
                            <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm truncate">{person.name}</h4>
                                <p className="text-xs text-muted-foreground truncate">{person.profession}</p>
                              </div>
                              <Badge variant="outline" className="text-xs shrink-0">
                                <IconComponent className="w-3 h-3 mr-1" />
                                {person.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{birthDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {isDeceased ? 'Lived ' : ''}{age} years{isDeceased ? ' old' : ' old'}
                              </span>
                            </div>

                            {person.wikipediaUrl && (
                              <a
                                href={person.wikipediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View on Wikipedia
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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

      <CelebrityProfileDialog
        person={selectedPerson}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};
