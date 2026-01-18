import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  birthDate: Date | null;
}

const zodiacSigns = {
  'Aries': { dates: '3/21-4/19', emoji: '♈', traits: 'Bold, energetic, pioneering' },
  'Taurus': { dates: '4/20-5/20', emoji: '♉', traits: 'Reliable, practical, devoted' },
  'Gemini': { dates: '5/21-6/20', emoji: '♊', traits: 'Curious, adaptable, expressive' },
  'Cancer': { dates: '6/21-7/22', emoji: '♋', traits: 'Intuitive, emotional, protective' },
  'Leo': { dates: '7/23-8/22', emoji: '♌', traits: 'Confident, generous, dramatic' },
  'Virgo': { dates: '8/23-9/22', emoji: '♍', traits: 'Analytical, kind, hardworking' },
  'Libra': { dates: '9/23-10/22', emoji: '♎', traits: 'Diplomatic, gracious, fair-minded' },
  'Scorpio': { dates: '10/23-11/21', emoji: '♏', traits: 'Passionate, resourceful, brave' },
  'Sagittarius': { dates: '11/22-12/21', emoji: '♐', traits: 'Generous, idealistic, adventurous' },
  'Capricorn': { dates: '12/22-1/19', emoji: '♑', traits: 'Responsible, disciplined, self-controlled' },
  'Aquarius': { dates: '1/20-2/18', emoji: '♒', traits: 'Progressive, original, independent' },
  'Pisces': { dates: '2/19-3/20', emoji: '♓', traits: 'Compassionate, artistic, intuitive' }
};

const birthstones = {
  1: { name: 'Garnet', color: 'Deep Red', meaning: 'Protection and strength' },
  2: { name: 'Amethyst', color: 'Purple', meaning: 'Wisdom and clarity' },
  3: { name: 'Aquamarine', color: 'Blue-green', meaning: 'Courage and communication' },
  4: { name: 'Diamond', color: 'Clear', meaning: 'Eternal love and strength' },
  5: { name: 'Emerald', color: 'Green', meaning: 'Growth and harmony' },
  6: { name: 'Pearl', color: 'White/Cream', meaning: 'Purity and wisdom' },
  7: { name: 'Ruby', color: 'Red', meaning: 'Passion and vitality' },
  8: { name: 'Peridot', color: 'Olive Green', meaning: 'Healing and protection' },
  9: { name: 'Sapphire', color: 'Blue', meaning: 'Truth and loyalty' },
  10: { name: 'Opal', color: 'Multi-colored', meaning: 'Hope and creativity' },
  11: { name: 'Topaz', color: 'Golden Yellow', meaning: 'Friendship and healing' },
  12: { name: 'Turquoise', color: 'Blue-green', meaning: 'Success and good fortune' }
};

const historicalEventsByMonth: Record<number, Array<{ event: string, icon: string, region: string, wikipediaUrl: string }>> = {
  1: [ // January
    { event: 'Martin Luther King Jr. Day celebrates civil rights (USA)', icon: '✊', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Martin_Luther_King_Jr._Day' },
    { event: 'Republic Day marks India\'s constitution adoption (26th)', icon: '🇮🇳', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Republic_Day_(India)' },
    { event: 'Chinese New Year celebrations begin (varies)', icon: '🧧', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Chinese_New_Year' },
    { event: 'Australia Day honors Australian culture (26th)', icon: '🇦🇺', region: 'Oceania', wikipediaUrl: 'https://en.wikipedia.org/wiki/Australia_Day' },
    { event: 'New Year traditions worldwide mark fresh beginnings', icon: '🎊', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/New_Year%27s_Day' },
    { event: 'The coldest month in the Northern Hemisphere', icon: '❄️', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Winter' }
  ],
  2: [ // February
    { event: 'Valentine\'s Day celebrates love worldwide (14th)', icon: '💕', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Valentine%27s_Day' },
    { event: 'Maha Shivaratri - Hindu festival honoring Lord Shiva', icon: '🕉️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Maha_Shivaratri' },
    { event: 'Carnival celebrations in Brazil and Europe', icon: '🎭', region: 'Americas/Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Carnival' },
    { event: 'Black History Month honors African American achievements', icon: '📚', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Black_History_Month' },
    { event: 'Cherry blossom festivals begin in Japan', icon: '🌸', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Cherry_blossom' },
    { event: 'Shortest month of the year with 28/29 days', icon: '📅', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/February' }
  ],
  3: [ // March
    { event: 'Holi - Festival of Colors celebrated in India', icon: '🎨', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Holi' },
    { event: 'International Women\'s Day (8th) honors women globally', icon: '👩', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/International_Women%27s_Day' },
    { event: 'St. Patrick\'s Day celebrates Irish culture (17th)', icon: '☘️', region: 'Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Saint_Patrick%27s_Day' },
    { event: 'Spring equinox brings equal day and night (20th)', icon: '🌸', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/March_equinox' },
    { event: 'Nowruz - Persian New Year in Central Asia', icon: '🌺', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Nowruz' },
    { event: 'Cherry blossoms peak in Japan and Korea', icon: '🌸', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Cherry_blossom' }
  ],
  4: [ // April
    { event: 'Earth Day promotes environmental protection (22nd)', icon: '🌍', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Earth_Day' },
    { event: 'Songkran - Thai New Year water festival', icon: '💦', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Songkran_(Thailand)' },
    { event: 'Cherry blossoms bloom across Europe and Asia', icon: '🌸', region: 'Europe/Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Cherry_blossom' },
    { event: 'Hanami - Cherry blossom viewing in Japan', icon: '🌸', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Hanami' },
    { event: 'Easter celebrations vary by date', icon: '🐣', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Easter' },
    { event: 'Spring renewal and new beginnings worldwide', icon: '🌱', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Spring_(season)' }
  ],
  5: [ // May
    { event: 'Buddha Purnima celebrates Buddha\'s birth', icon: '☸️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Vesak' },
    { event: 'Victory Day commemorates WWII end in Europe (8th)', icon: '🕊️', region: 'Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Victory_Day_(9_May)' },
    { event: 'Cinco de Mayo celebrates Mexican heritage (5th)', icon: '🇲🇽', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Cinco_de_Mayo' },
    { event: 'Mother\'s Day honors maternal figures worldwide', icon: '🌹', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mother%27s_Day' },
    { event: 'Vesak - Buddhist celebration across Asia', icon: '🪔', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Vesak' },
    { event: 'Spring flowers at peak bloom globally', icon: '🌺', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Spring_(season)' }
  ],
  6: [ // June
    { event: 'Summer solstice - longest day of the year (21st)', icon: '☀️', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Summer_solstice' },
    { event: 'Eid al-Adha - Islamic festival (varies)', icon: '🕌', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Eid_al-Adha' },
    { event: 'Dragon Boat Festival in China', icon: '🐉', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Dragon_Boat_Festival' },
    { event: 'Father\'s Day celebrates paternal figures', icon: '👔', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Father%27s_Day' },
    { event: 'Pride Month celebrates LGBTQ+ community', icon: '🏳️‍🌈', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gay_pride' },
    { event: 'Monsoon season begins in India', icon: '🌧️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Monsoon_of_South_Asia' }
  ],
  7: [ // July
    { event: 'Independence Day in the United States (4th)', icon: '🎆', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Independence_Day_(United_States)' },
    { event: 'Bastille Day in France (14th)', icon: '🇫🇷', region: 'Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bastille_Day' },
    { event: 'Guru Purnima - honoring teachers in India', icon: '📿', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Guru_Purnima' },
    { event: 'Summer festivals across Europe and Asia', icon: '🎪', region: 'Europe/Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Summer_festival' },
    { event: 'Monsoon season at its peak in South Asia', icon: '🌧️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Monsoon_of_South_Asia' },
    { event: 'Warmest month in the Northern Hemisphere', icon: '🌡️', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Summer' }
  ],
  8: [ // August
    { event: 'Independence Day in India (15th)', icon: '🇮🇳', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Independence_Day_(India)' },
    { event: 'Indonesia Independence Day (17th)', icon: '🇮🇩', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Independence_Day_(Indonesia)' },
    { event: 'Raksha Bandhan - sibling bond festival in India', icon: '🧵', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Raksha_Bandhan' },
    { event: 'Obon Festival honors ancestors in Japan', icon: '🏮', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bon_Festival' },
    { event: 'Perseid meteor showers light up night skies', icon: '🌠', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Perseids' },
    { event: 'Late summer harvest time for crops', icon: '🌾', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Harvest' }
  ],
  9: [ // September
    { event: 'Autumn equinox marks the start of fall (22nd)', icon: '🍂', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/September_equinox' },
    { event: 'Ganesh Chaturthi - Hindu festival in India', icon: '🐘', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Ganesh_Chaturthi' },
    { event: 'Mid-Autumn Festival celebrates harvest in China', icon: '🥮', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Mid-Autumn_Festival' },
    { event: 'Oktoberfest begins in Germany', icon: '🍺', region: 'Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Oktoberfest' },
    { event: 'Leaves begin colorful transformation', icon: '🍁', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Autumn_leaf_color' },
    { event: 'Back-to-school season across the globe', icon: '📚', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Academic_term' }
  ],
  10: [ // October
    { event: 'Gandhi Jayanti honors Mahatma Gandhi (2nd)', icon: '🕊️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gandhi_Jayanti' },
    { event: 'Diwali - Festival of Lights in India (varies)', icon: '🪔', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Diwali' },
    { event: 'Dussehra celebrates victory of good over evil', icon: '🏹', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Vijayadashami' },
    { event: 'Halloween celebrates spooky traditions (31st)', icon: '🎃', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Halloween' },
    { event: 'Oktoberfest peaks in Bavaria, Germany', icon: '🍺', region: 'Europe', wikipediaUrl: 'https://en.wikipedia.org/wiki/Oktoberfest' },
    { event: 'Fall colors are at their most vibrant', icon: '🍂', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Autumn_leaf_color' }
  ],
  11: [ // November
    { event: 'Diwali festivities continue (varies)', icon: '🪔', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Diwali' },
    { event: 'Thanksgiving brings families together (USA)', icon: '🦃', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Thanksgiving_(United_States)' },
    { event: 'Day of the Dead honors ancestors (Mexico)', icon: '💀', region: 'Americas', wikipediaUrl: 'https://en.wikipedia.org/wiki/Day_of_the_Dead' },
    { event: 'Loy Krathong Festival of Lights (Thailand)', icon: '🏮', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Loi_Krathong' },
    { event: 'Remembrance Day honors war veterans (11th)', icon: '🎗️', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Remembrance_Day' },
    { event: 'Autumn transitions into winter', icon: '🍁', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Autumn' }
  ],
  12: [ // December
    { event: 'Winter solstice - shortest day of the year (21st)', icon: '❄️', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Winter_solstice' },
    { event: 'Christmas celebrations worldwide (25th)', icon: '🎄', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Christmas' },
    { event: 'Hanukkah - Jewish Festival of Lights (varies)', icon: '🕎', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Hanukkah' },
    { event: 'Bodhi Day celebrates Buddha\'s enlightenment (8th)', icon: '☸️', region: 'Asia', wikipediaUrl: 'https://en.wikipedia.org/wiki/Bodhi_Day' },
    { event: 'New Year\'s Eve celebrations globally (31st)', icon: '🎊', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/New_Year%27s_Eve' },
    { event: 'Holiday season brings festive celebrations', icon: '🎁', region: 'Global', wikipediaUrl: 'https://en.wikipedia.org/wiki/Christmas_and_holiday_season' }
  ]
};

const getZodiacSign = (month: number, day: number): string => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  return 'Pisces';
};

export const ZodiacAndFacts = ({ birthDate }: Props) => {
  if (!birthDate) return null;

  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const year = birthDate.getFullYear();
  
  const zodiacSign = getZodiacSign(month, day);
  const birthstone = birthstones[month as keyof typeof birthstones];
  
  // Get historical events for birth month
  const monthEvents = historicalEventsByMonth[month as keyof typeof historicalEventsByMonth] || [];
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Zodiac Sign - Clickable Link */}
      <Link to="/zodiac" className="block group">
        <Card className="backdrop-blur-sm bg-background/80 border-accent/30 hover:border-accent/50 hover:shadow-lg transition-all h-full">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">{zodiacSigns[zodiacSign as keyof typeof zodiacSigns].emoji}</div>
            <CardTitle className="flex items-center justify-center gap-2 group-hover:text-accent transition-colors">
              <Star className="w-5 h-5 text-accent" />
              You're a {zodiacSign}!
            </CardTitle>
            <CardDescription>
              {zodiacSigns[zodiacSign as keyof typeof zodiacSigns].dates}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              {zodiacSigns[zodiacSign as keyof typeof zodiacSigns].traits}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Click to learn more about your zodiac sign →</p>
          </CardContent>
        </Card>
      </Link>

      {/* Birthstone - Clickable Link */}
      <Link to="/birthstone" className="block group">
        <Card className="backdrop-blur-sm bg-background/80 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all h-full">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">💎</div>
            <CardTitle className="flex items-center justify-center gap-2 group-hover:text-primary transition-colors">
              <Sparkles className="w-5 h-5 text-primary" />
              Your Birthstone
            </CardTitle>
            <CardDescription>
              {birthstone.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className="text-sm text-muted-foreground">
              Color: {birthstone.color}
            </div>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {birthstone.meaning}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">Click to discover more about your birthstone →</p>
          </CardContent>
        </Card>
      </Link>

      {/* Fun Facts for Birth Month - With Wikipedia Links */}
      <Card className="backdrop-blur-sm bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30 md:col-span-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Calendar className="w-6 h-6 text-secondary" />
            Fun Facts About {monthNames[month - 1]}
          </CardTitle>
          <CardDescription>Special things about your birth month - Click to learn more on Wikipedia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthEvents.map((fact, index) => (
              <a 
                key={index} 
                href={fact.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-background/60 rounded-lg border border-secondary/20 hover:border-secondary/50 hover:bg-background/80 transition-all hover:shadow-md group"
              >
                <div className="text-3xl mb-2 text-center">{fact.icon}</div>
                <p className="text-sm text-center text-foreground leading-relaxed font-medium mb-1 group-hover:text-secondary transition-colors">
                  {fact.event}
                </p>
                <Badge variant="outline" className="w-full justify-center text-xs mt-2">
                  {fact.region}
                </Badge>
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
