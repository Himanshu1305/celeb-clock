import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Info, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export const BmiCalculator = ({ value, onChange }: Props) => {
  const [knowsBmi, setKnowsBmi] = useState<'yes' | 'no'>('yes');
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (knowsBmi === 'no' && height && weight) {
      const h = parseFloat(height);
      const w = parseFloat(weight);
      
      if (h > 0 && w > 0) {
        let bmi: number;
        if (unit === 'metric') {
          // BMI = weight (kg) / (height (m))²
          const heightInMeters = h / 100;
          bmi = w / (heightInMeters * heightInMeters);
        } else {
          // BMI = (weight (lbs) / (height (in))²) * 703
          bmi = (w / (h * h)) * 703;
        }
        onChange(Math.round(bmi * 10) / 10);
      }
    }
  }, [height, weight, unit, knowsBmi, onChange]);

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
  };

  const category = getBmiCategory(value);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-base flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Do you know your BMI?
        </Label>
        <RadioGroup value={knowsBmi} onValueChange={(v) => setKnowsBmi(v as 'yes' | 'no')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="knows-bmi-yes" />
            <Label htmlFor="knows-bmi-yes">Yes, I know my BMI</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="knows-bmi-no" />
            <Label htmlFor="knows-bmi-no">No, calculate it for me</Label>
          </div>
        </RadioGroup>
      </div>

      {knowsBmi === 'yes' ? (
        <div>
          <Label className="text-base flex items-center gap-2 mb-3">
            BMI: {value}
            <Badge variant="outline" className={category.color}>
              {category.label}
            </Badge>
          </Label>
          <Slider
            value={[value]}
            onValueChange={(v) => onChange(v[0])}
            max={45}
            min={15}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15</span>
            <span>30</span>
            <span>45</span>
          </div>
        </div>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <Label className="text-sm">Measurement Unit</Label>
              <RadioGroup value={unit} onValueChange={(v) => setUnit(v as 'metric' | 'imperial')}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric">Metric (cm, kg)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial">Imperial (inches, lbs)</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">
                  Height {unit === 'metric' ? '(cm)' : '(inches)'}
                </Label>
                <Input
                  type="number"
                  placeholder={unit === 'metric' ? '170' : '67'}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
                </Label>
                <Input
                  type="number"
                  placeholder={unit === 'metric' ? '70' : '154'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            {value && (
              <div className="text-center p-3 bg-background rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Your BMI</div>
                <div className="text-3xl font-bold text-primary">{value}</div>
                <Badge variant="outline" className={`mt-2 ${category.color}`}>
                  {category.label}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Collapsible open={showInfo} onOpenChange={setShowInfo}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Info className="w-4 h-4 mr-2" />
            {showInfo ? 'Hide' : 'Show'} BMI Information
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 bg-accent/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-base">About Body Mass Index (BMI)</CardTitle>
              <CardDescription className="text-sm">Understanding your BMI and its health implications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-2">What is BMI?</p>
                <p className="text-muted-foreground">
                  Body Mass Index (BMI) is a measure of body fat based on height and weight. It's calculated as: 
                  <strong> weight (kg) / height (m)²</strong>
                </p>
              </div>
              
              <div>
                <p className="font-medium mb-2">BMI Categories (WHO/CDC Guidelines)</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Underweight:</span>
                    <span className="text-blue-600 font-medium">BMI &lt; 18.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Normal weight:</span>
                    <span className="text-green-600 font-medium">BMI 18.5 - 24.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overweight:</span>
                    <span className="text-yellow-600 font-medium">BMI 25 - 29.9</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Obese:</span>
                    <span className="text-red-600 font-medium">BMI ≥ 30</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Health Impact</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p><strong>Underweight (BMI &lt; 18.5):</strong> May indicate malnutrition, can reduce life expectancy by ~2 years. Risk of weakened immune system and osteoporosis.</p>
                  <p><strong>Normal (BMI 18.5-24.9):</strong> Optimal range for longevity and health. Associated with lowest mortality risk.</p>
                  <p><strong>Overweight (BMI 25-29.9):</strong> Modest increased health risks, may reduce life expectancy by ~1 year. Preventive lifestyle changes recommended.</p>
                  <p><strong>Obese (BMI ≥ 30):</strong> Significant health risks including diabetes, heart disease, can reduce life expectancy by ~3 years. Medical consultation advised.</p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                <p><strong>Note:</strong> BMI is a screening tool and doesn't directly measure body fat or health. Athletes with high muscle mass may have high BMI but low body fat. Consult healthcare professionals for personalized assessment.</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
