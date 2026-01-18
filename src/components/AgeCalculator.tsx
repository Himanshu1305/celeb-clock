import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAgeCalculator } from '@/hooks/useAgeCalculator';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface AgeCalculatorProps {
  onBirthDateChange?: (date: Date | null) => void;
  initialDate?: Date | null;
}

const CounterCard = ({ value, label, unit }: { value: number; label: string; unit?: string }) => (
  <div className="glass-card p-4 text-center animate-fade-in-up">
    <div className="text-2xl md:text-3xl font-bold gradient-text-primary mb-1 animate-counter-tick">
      {value.toLocaleString()}{unit}
    </div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

export const AgeCalculator = ({ onBirthDateChange, initialDate }: AgeCalculatorProps) => {
  const [birthDate, setBirthDate] = useState<Date | null>(initialDate || null);
  const [inputValue, setInputValue] = useState<string>('');
  const ageData = useAgeCalculator(birthDate);

  // Set initial date value for input field
  useEffect(() => {
    if (initialDate) {
      setBirthDate(initialDate);
      // Format date as YYYY-MM-DD for input
      const formatted = initialDate.toISOString().split('T')[0];
      setInputValue(formatted);
    }
  }, [initialDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const newDate = value ? new Date(value) : null;
    console.log('AgeCalculator - date changed:', { value, newDate });
    setBirthDate(newDate);
    onBirthDateChange?.(newDate);
    console.log('AgeCalculator - called onBirthDateChange with:', newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 animate-fade-in-up">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ClockIcon className="h-8 w-8 text-primary animate-pulse-glow" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold gradient-text-primary">
          Age Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover your precise age and see the time ticking by in real-time
        </p>
      </div>

      {/* Date Input */}
      <Card className="glass-card p-6 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="birthdate" className="text-base font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Enter Your Birth Date
          </Label>
          <Input
            id="birthdate"
            type="date"
            onChange={handleDateChange}
            max={new Date().toISOString().split('T')[0]}
            className="text-lg"
          />
        </div>
      </Card>

      {/* Age Display */}
      {ageData && (
        <div className="space-y-8">
          {/* Main Age */}
          <div className="text-center">
            <div className="text-6xl md:text-8xl font-bold gradient-text-secondary mb-2 animate-counter-tick">
              {ageData.years}
            </div>
            <div className="text-2xl text-muted-foreground">
              Years Old
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <CounterCard value={ageData.years} label="Years" />
            <CounterCard value={ageData.months} label="Months" />
            <CounterCard value={ageData.days} label="Days" />
            <CounterCard value={ageData.hours} label="Hours" />
            <CounterCard value={ageData.minutes} label="Minutes" />
            <CounterCard value={ageData.seconds} label="Seconds" />
          </div>

          {/* Total Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CounterCard value={ageData.totalDays} label="Total Days Lived" />
            <CounterCard value={ageData.totalHours} label="Total Hours" />
            <CounterCard value={ageData.totalMinutes} label="Total Minutes" />
            <CounterCard value={ageData.totalSeconds} label="Total Seconds" />
          </div>
        </div>
      )}

      {!ageData && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-float">⏰</div>
          <p className="text-xl text-muted-foreground">
            Enter your birth date to see the magic happen!
          </p>
        </div>
      )}
    </div>
  );
};