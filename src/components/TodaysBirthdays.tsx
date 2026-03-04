import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Cake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBirthdayData, getCategoryIcon } from '@/data/birthdayData';

export const TodaysBirthdays = () => {
  const navigate = useNavigate();
  const today = new Date();
  const data = getBirthdayData(today.getMonth() + 1, today.getDate());
  const people = data.people.slice(0, 8);

  if (people.length === 0) return null;

  return (
    <Card className="glass-card">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold gradient-text-primary">
            <Cake className="inline w-7 h-7 mr-2" />
            Born Today
          </h2>
          <p className="text-muted-foreground">
            Famous people celebrating their birthday on {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {people.map((person) => {
            const Icon = getCategoryIcon(person.category);
            return (
              <div
                key={person.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 hover:shadow-sm transition-shadow"
              >
                <div className="shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{person.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{person.profession}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/celebrity-birthday')}>
            See More Celebrity Birthdays
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
