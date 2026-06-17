export interface GenerationBasic {
  name: string;
  range: string;
  emoji: string;
}

const GENERATION_DATA: Array<{ min: number; max: number } & GenerationBasic> = [
  { min: 2013, max: 2099, name: 'Gen Alpha',         range: '2013–present', emoji: '🤖' },
  { min: 1997, max: 2012, name: 'Gen Z',              range: '1997–2012',   emoji: '⚡' },
  { min: 1981, max: 1996, name: 'Millennial',         range: '1981–1996',   emoji: '🌐' },
  { min: 1965, max: 1980, name: 'Gen X',              range: '1965–1980',   emoji: '🎸' },
  { min: 1946, max: 1964, name: 'Baby Boomer',        range: '1946–1964',   emoji: '✌️' },
  { min: 1928, max: 1945, name: 'Silent Generation',  range: '1928–1945',   emoji: '📻' },
];

export function getGenerationBasic(year: number): GenerationBasic | null {
  const match = GENERATION_DATA.find(g => year >= g.min && year <= g.max);
  if (!match) return null;
  return { name: match.name, range: match.range, emoji: match.emoji };
}
