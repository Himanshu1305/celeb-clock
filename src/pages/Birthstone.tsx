import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthNav } from '@/components/AuthNav';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Gem } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const birthstones = [
  {
    month: "January",
    stone: "Garnet",
    color: "#9C1F2F",
    meaning: "Protection, Friendship, Trust",
    description: "Garnet symbolizes protection and strength. This deep red gemstone is believed to bring peace, prosperity, and good health to the wearer. Garnets have been treasured throughout history by ancient civilizations including the Egyptians, Greeks, and Romans.",
    properties: ["Boosts energy", "Enhances confidence", "Promotes success"],
    history: "Garnets were worn as protective talismans by warriors and travelers. Ancient cultures believed they could light up the night and protect against nightmares.",
    healing: "Known to revitalize feelings, enhance libido, and bring serenity or passion as appropriate. Garnet balances the sex drive and alleviates emotional disharmony."
  },
  {
    month: "February",
    stone: "Amethyst",
    color: "#9966CC",
    meaning: "Wisdom, Peace, Courage",
    description: "Amethyst represents wisdom and spiritual growth. This purple gemstone is known for its calming properties and ability to enhance intuition. Ancient Greeks believed it protected against intoxication, and it has been prized by royalty throughout history.",
    properties: ["Relieves stress", "Enhances intuition", "Promotes clarity"],
    history: "Amethyst has been used in royal crowns and religious jewelry for centuries. It was believed to keep the mind clear and help in battle.",
    healing: "Promotes inner peace and spiritual wisdom. Amethyst helps overcome addictions, blocks negative environmental energies, and enhances higher states of consciousness."
  },
  {
    month: "March",
    stone: "Aquamarine",
    color: "#7FFFD4",
    meaning: "Serenity, Harmony, Youth",
    description: "Aquamarine embodies the tranquility of the sea. This blue-green gemstone is associated with calming energy and clear communication. Sailors traditionally carried aquamarine for protection and safe passage across the ocean.",
    properties: ["Promotes calmness", "Encourages honesty", "Enhances courage"],
    history: "Ancient Romans believed aquamarine protected sailors and guaranteed a safe voyage. It was also thought to rekindle love in married couples.",
    healing: "Calms the mind, reduces stress, and sharpens intellect. Aquamarine is useful for closure on all levels and helps overcome fear of speaking."
  },
  {
    month: "April",
    stone: "Diamond",
    color: "#E8E8E8",
    meaning: "Purity, Strength, Love",
    description: "Diamond represents eternal love and invincibility. This precious gemstone symbolizes clarity, strength, and everlasting bonds. Diamonds are the hardest natural substance on Earth, making them a perfect symbol of endurance.",
    properties: ["Amplifies energy", "Brings clarity", "Symbolizes commitment"],
    history: "Ancient Hindus believed diamonds were created when bolts of lightning struck rocks. Romans thought they were splinters of fallen stars.",
    healing: "Amplifies energy and intention. Diamonds bring clarity of mind, inspire creativity, and help manifest abundance and prosperity."
  },
  {
    month: "May",
    stone: "Emerald",
    color: "#50C878",
    meaning: "Rebirth, Love, Fertility",
    description: "Emerald signifies renewal and growth. This vibrant green gemstone is associated with fertility, rebirth, and unconditional love. Cleopatra famously adored emeralds and claimed ownership of all emerald mines in Egypt.",
    properties: ["Enhances memory", "Promotes growth", "Attracts abundance"],
    history: "Ancient Egyptians mined emeralds as early as 1500 BC. They were associated with fertility and rebirth, symbolizing eternal spring.",
    healing: "Known as the stone of successful love, emerald brings domestic bliss and loyalty. It enhances unity, unconditional love, and promotes friendship."
  },
  {
    month: "June",
    stone: "Pearl",
    color: "#F0EAD6",
    meaning: "Purity, Innocence, Faith",
    description: "Pearl represents purity and wisdom. This organic gemstone is associated with integrity, loyalty, and emotional balance. Unlike other gemstones, pearls are created by living organisms, making them truly unique.",
    properties: ["Promotes calmness", "Enhances integrity", "Brings wisdom"],
    history: "In ancient Rome, pearls were considered the ultimate symbol of wealth and status. Chinese royalty believed pearls guaranteed protection from fire and dragons.",
    healing: "Calms and centers, promotes faith and loyalty. Pearls help one see oneself clearly and attune to the ebb and flow of life."
  },
  {
    month: "July",
    stone: "Ruby",
    color: "#E0115F",
    meaning: "Passion, Protection, Prosperity",
    description: "Ruby symbolizes passion and vitality. This rich red gemstone is believed to bring good fortune and protect against negative energy. Rubies have been treasured by royalty and nobility throughout history for their beauty and power.",
    properties: ["Boosts vitality", "Enhances passion", "Promotes courage"],
    history: "Ancient Hindus believed rubies contained the spark of life. Burmese warriors implanted rubies under their skin for protection in battle.",
    healing: "Stimulates the heart chakra, encourages passion for life. Ruby overcomes exhaustion and lethargy, imparting potency and vigor."
  },
  {
    month: "August",
    stone: "Peridot",
    color: "#9EDD3A",
    meaning: "Strength, Power, Growth",
    description: "Peridot represents strength and renewal. This lime-green gemstone is known for its positive energy and healing properties. Ancient Egyptians called peridot the 'gem of the sun' and believed it protected against nightmares.",
    properties: ["Relieves stress", "Promotes healing", "Enhances confidence"],
    history: "Cleopatra's famous emerald collection may have actually been peridot. Ancient Egyptians harvested it from the volcanic island of Zabargad.",
    healing: "Powerful cleanser, releasing toxins on all levels. Peridot alleviates jealousy and resentment, enhancing confidence and assertion without aggression."
  },
  {
    month: "September",
    stone: "Sapphire",
    color: "#0F52BA",
    meaning: "Wisdom, Loyalty, Nobility",
    description: "Sapphire symbolizes wisdom and royalty. This deep blue gemstone is associated with truth, loyalty, and spiritual enlightenment. Sapphires have been worn by royalty and clergy for centuries as symbols of wisdom and purity.",
    properties: ["Enhances focus", "Promotes wisdom", "Brings inner peace"],
    history: "Medieval clergy wore sapphires to symbolize Heaven. Ancient Persians believed the earth rested on a giant sapphire, which made the sky blue.",
    healing: "Releases mental tension and unwanted thoughts. Sapphire brings prosperity and attracts gifts of all kinds, opening the mind to beauty and intuition."
  },
  {
    month: "October",
    stone: "Opal",
    color: "#FFFFFF",
    meaning: "Hope, Creativity, Innocence",
    description: "Opal represents hope and creativity. This iridescent gemstone is known for its ability to enhance imagination and emotional expression. Opal's play of color has fascinated humans for thousands of years, with each stone being completely unique.",
    properties: ["Stimulates creativity", "Enhances originality", "Promotes spontaneity"],
    history: "Romans considered opal a symbol of hope and purity. Arabs believed opals fell from heaven in flashes of lightning.",
    healing: "Amplifies traits and brings characteristics to the surface for transformation. Opal enhances cosmic consciousness and induces psychic and mystical visions."
  },
  {
    month: "November",
    stone: "Topaz",
    color: "#FFB347",
    meaning: "Love, Affection, Joy",
    description: "Topaz symbolizes love and affection. This golden gemstone is believed to bring joy, generosity, and abundance to the wearer. The ancient Greeks believed topaz gave them strength, and it was used to increase strength and make its wearer invisible.",
    properties: ["Promotes joy", "Enhances generosity", "Brings abundance"],
    history: "Ancient Egyptians believed the golden glow of topaz came from the sun god Ra. It was thought to protect against harm and bring wisdom.",
    healing: "Soothes, heals, stimulates, recharges, and aligns the meridians. Topaz promotes truth and forgiveness, bringing joy and generosity."
  },
  {
    month: "December",
    stone: "Turquoise",
    color: "#40E0D0",
    meaning: "Success, Good Fortune, Protection",
    description: "Turquoise represents protection and good fortune. This blue-green gemstone is known for its healing properties and positive energy. Native Americans considered turquoise a sacred stone, using it in ceremonies and as a symbol of the unity of earth and sky.",
    properties: ["Promotes healing", "Enhances communication", "Brings good luck"],
    history: "Ancient Egyptians adorned themselves with turquoise jewelry. Native American tribes considered it a bridge between heaven and earth.",
    healing: "Purification stone, dispelling negative energy. Turquoise stabilizes mood swings, promotes self-realization, and aids creative problem-solving."
  }
];

export default function Birthstone() {
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
          <div className="flex justify-center mb-4">
            <Gem className="w-16 h-16 text-accent" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Birthstone Guide
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the precious gemstones associated with each month. Discover their meanings, 
            properties, and the unique symbolism behind your birth month's stone.
          </p>
        </div>

        <Separator className="mb-12" />

        {/* Birthstones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {birthstones.map((item, index) => (
            <Card 
              key={item.month} 
              className="hover-scale transition-all hover:shadow-lg overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div 
                className="h-3 w-full" 
                style={{ backgroundColor: item.color }}
              />
              <CardHeader>
                <CardTitle className="font-heading text-xl flex items-center gap-2">
                  <Gem className="w-5 h-5" style={{ color: item.color }} />
                  {item.month}
                </CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  {item.stone}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-heading font-semibold text-sm mb-1 text-accent">Meaning</h4>
                  <p className="text-sm text-muted-foreground">{item.meaning}</p>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {item.history && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-1 text-primary">Historical Significance</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.history}</p>
                  </div>
                )}

                {item.healing && (
                  <div>
                    <h4 className="font-heading font-semibold text-sm mb-1 text-secondary">Healing Properties</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.healing}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-heading font-semibold text-sm mb-2">Properties:</h4>
                  <div className="space-y-1">
                    {item.properties.map((prop) => (
                      <div key={prop} className="flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span className="text-xs text-muted-foreground">{prop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-accent text-accent-foreground">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Discover your birthstone</CardTitle>
              <CardDescription className="text-accent-foreground/80">
                Enter your birth date on our age calculator to find out your birthstone and unlock more personalized insights!
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
