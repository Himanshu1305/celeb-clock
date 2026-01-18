import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const zodiacSigns = [
  {
    name: "Aries",
    emoji: "♈",
    dates: "March 21 - April 19",
    element: "Fire",
    traits: ["Courageous", "Determined", "Confident", "Enthusiastic", "Passionate", "Impulsive"],
    description: "Aries are natural leaders, full of energy and passion. They are adventurous and always ready to take on new challenges. As the first sign of the zodiac, Aries embodies the spirit of beginnings and pioneering endeavors. Their dynamic personality makes them excellent at initiating projects and inspiring others.",
    strengths: "Aries individuals excel at taking initiative, leading teams, and making quick decisions. Their enthusiasm is contagious and they have an incredible ability to bounce back from setbacks.",
    challenges: "Their impulsive nature can sometimes lead to hasty decisions. Learning patience and considering consequences before acting can help Aries achieve even greater success."
  },
  {
    name: "Taurus",
    emoji: "♉",
    dates: "April 20 - May 20",
    element: "Earth",
    traits: ["Reliable", "Patient", "Practical", "Devoted", "Stable", "Sensual"],
    description: "Taurus individuals are grounded and stable. They appreciate beauty, comfort, and the finer things in life. Known for their reliability and determination, Taureans are the builders of the zodiac. They have an eye for aesthetics and a deep appreciation for art, music, and nature.",
    strengths: "Taurus excels at maintaining stability, building lasting foundations, and creating beauty. Their patience and persistence ensure they complete what they start with excellence.",
    challenges: "Their stubbornness can sometimes prevent growth. Learning flexibility and being open to change can help Taurus expand their horizons."
  },
  {
    name: "Gemini",
    emoji: "♊",
    dates: "May 21 - June 20",
    element: "Air",
    traits: ["Adaptable", "Outgoing", "Intelligent", "Curious", "Witty", "Versatile"],
    description: "Geminis are social butterflies with quick wit and excellent communication skills. They thrive on variety and mental stimulation. Represented by the Twins, Geminis have the ability to see multiple perspectives and adapt to any situation. Their curiosity drives them to constantly learn and explore.",
    strengths: "Gemini shines in communication, networking, and learning. Their versatility allows them to excel in multiple fields and connect diverse people and ideas.",
    challenges: "Their scattered energy can lead to inconsistency. Focusing on depth rather than breadth and following through on commitments will enhance their success."
  },
  {
    name: "Cancer",
    emoji: "♋",
    dates: "June 21 - July 22",
    element: "Water",
    traits: ["Intuitive", "Emotional", "Protective", "Sympathetic", "Nurturing", "Loyal"],
    description: "Cancer individuals are deeply caring and nurturing. They value home, family, and emotional connections. Ruled by the Moon, Cancers are highly intuitive and emotionally intelligent. They create safe spaces where others can feel comfortable and loved.",
    strengths: "Cancer excels at emotional support, creating home environments, and building deep relationships. Their empathy and intuition make them natural healers and counselors.",
    challenges: "Overprotectiveness and mood swings can create challenges. Learning to set healthy boundaries and managing emotions constructively will support their wellbeing."
  },
  {
    name: "Leo",
    emoji: "♌",
    dates: "July 23 - August 22",
    element: "Fire",
    traits: ["Creative", "Passionate", "Generous", "Cheerful", "Confident", "Dramatic"],
    description: "Leos are natural performers who love being in the spotlight. They are warm-hearted and have a magnetic personality. Ruled by the Sun, Leos radiate confidence and creativity. Their generous spirit and natural leadership inspire and uplift those around them.",
    strengths: "Leo excels at creative expression, leadership, and inspiring others. Their confidence and warmth make them natural entertainers and motivators.",
    challenges: "Their need for attention can overshadow others. Balancing self-expression with humility and recognizing others' contributions will enhance their relationships."
  },
  {
    name: "Virgo",
    emoji: "♍",
    dates: "August 23 - September 22",
    element: "Earth",
    traits: ["Analytical", "Practical", "Kind", "Hardworking", "Meticulous", "Helpful"],
    description: "Virgos are detail-oriented perfectionists with a strong sense of duty. They excel at organization and problem-solving. Ruled by Mercury, Virgos combine analytical thinking with practical application. Their dedication to service and improvement makes them invaluable in any team.",
    strengths: "Virgo excels at analysis, organization, and helping others improve. Their attention to detail and work ethic ensure excellence in everything they do.",
    challenges: "Perfectionism can lead to self-criticism and worry. Learning to accept imperfection and practice self-compassion will enhance their inner peace."
  },
  {
    name: "Libra",
    emoji: "♎",
    dates: "September 23 - October 22",
    element: "Air",
    traits: ["Diplomatic", "Gracious", "Fair-minded", "Social", "Romantic", "Harmonious"],
    description: "Libras seek balance and harmony in all aspects of life. They are charming, romantic, and natural peacemakers. Represented by the Scales, Libras have an innate sense of justice and aesthetics. They excel at creating beauty and bringing people together.",
    strengths: "Libra excels at diplomacy, creating harmony, and appreciating beauty. Their fair-mindedness and social grace make them excellent mediators and partners.",
    challenges: "Indecisiveness and people-pleasing can be challenging. Learning to make decisions confidently and prioritize their own needs will empower them."
  },
  {
    name: "Scorpio",
    emoji: "♏",
    dates: "October 23 - November 21",
    element: "Water",
    traits: ["Resourceful", "Passionate", "Brave", "Determined", "Intense", "Transformative"],
    description: "Scorpios are intense and mysterious with deep emotional intelligence. They are fiercely loyal and transformative. Ruled by Pluto and Mars, Scorpios possess incredible depth and power. Their ability to transform and regenerate makes them resilient and magnetic.",
    strengths: "Scorpio excels at depth, transformation, and uncovering truth. Their intensity and dedication make them powerful agents of change and loyal friends.",
    challenges: "Jealousy and controlling tendencies can arise. Learning trust and letting go will deepen their relationships and inner peace."
  },
  {
    name: "Sagittarius",
    emoji: "♐",
    dates: "November 22 - December 21",
    element: "Fire",
    traits: ["Generous", "Idealistic", "Great sense of humor", "Adventurous", "Philosophical", "Optimistic"],
    description: "Sagittarius individuals are free-spirited philosophers who love exploration and seeking truth. They are optimistic and adventurous. Ruled by Jupiter, Sagittarians have an expansive worldview and love of learning. Their enthusiasm for life and adventure is contagious.",
    strengths: "Sagittarius excels at inspiring others, exploring new horizons, and finding meaning. Their optimism and philosophical nature uplift everyone around them.",
    challenges: "Tactlessness and restlessness can create issues. Learning diplomacy and commitment will help them build deeper connections."
  },
  {
    name: "Capricorn",
    emoji: "♑",
    dates: "December 22 - January 19",
    element: "Earth",
    traits: ["Responsible", "Disciplined", "Self-controlled", "Ambitious", "Strategic", "Traditional"],
    description: "Capricorns are ambitious achievers with strong work ethic. They are practical, wise, and excellent at long-term planning. Ruled by Saturn, Capricorns understand the value of patience and perseverance. Their determination to reach the summit makes them natural leaders in business and life.",
    strengths: "Capricorn excels at planning, achieving goals, and building lasting structures. Their discipline and wisdom ensure long-term success.",
    challenges: "Workaholism and pessimism can limit joy. Learning to balance work with play and appreciate the journey will enhance their happiness."
  },
  {
    name: "Aquarius",
    emoji: "♒",
    dates: "January 20 - February 18",
    element: "Air",
    traits: ["Progressive", "Original", "Independent", "Humanitarian", "Innovative", "Intellectual"],
    description: "Aquarius individuals are innovative visionaries who think outside the box. They are intellectual, friendly, and value independence. Ruled by Uranus, Aquarians are the revolutionaries and reformers of the zodiac. Their unique perspective and humanitarian spirit drive social progress.",
    strengths: "Aquarius excels at innovation, humanitarian efforts, and intellectual pursuits. Their originality and vision create positive change in the world.",
    challenges: "Detachment and stubbornness about their views can distance others. Learning emotional expression and flexibility will deepen their connections."
  },
  {
    name: "Pisces",
    emoji: "♓",
    dates: "February 19 - March 20",
    element: "Water",
    traits: ["Compassionate", "Artistic", "Intuitive", "Gentle", "Wise", "Musical"],
    description: "Pisces are dreamers with deep emotional sensitivity and artistic talents. They are empathetic, spiritual, and imaginative. Ruled by Neptune, Pisceans have access to the collective unconscious and mystical realms. Their creativity and compassion make them natural artists and healers.",
    strengths: "Pisces excels at artistic expression, empathy, and spiritual understanding. Their imagination and compassion bring beauty and healing to the world.",
    challenges: "Escapism and boundary issues can be problematic. Learning to ground themselves and set healthy limits will enhance their wellbeing."
  }
];

export default function Zodiac() {
  return (
    <div className="min-h-screen bg-gradient-cosmic">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <Navigation />
          <AuthNav />
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Zodiac Signs Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the characteristics, traits, and elements associated with each zodiac sign. 
            Find your astrological identity and learn what makes each sign unique.
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Zodiac Signs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zodiacSigns.map((sign, index) => (
            <Card 
              key={sign.name} 
              className="hover-scale transition-all hover:shadow-lg"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-5xl">{sign.emoji}</span>
                  <div>
                    <CardTitle className="font-heading text-xl">{sign.name}</CardTitle>
                    <CardDescription className="text-sm">{sign.dates}</CardDescription>
                  </div>
                </div>
                <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  {sign.element}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sign.description}
                </p>
                {sign.strengths && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-1 text-green-600 dark:text-green-400">Strengths:</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sign.strengths}</p>
                  </div>
                )}
                {sign.challenges && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-1 text-orange-600 dark:text-orange-400">Growth Areas:</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sign.challenges}</p>
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-semibold text-sm mb-2">Key Traits:</h4>
                  <div className="flex flex-wrap gap-2">
                    {sign.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Want to know your zodiac sign?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Enter your birth date on our age calculator to discover your zodiac sign and much more!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button variant="secondary" size="lg" className="font-heading">
                  Calculate My Age
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
