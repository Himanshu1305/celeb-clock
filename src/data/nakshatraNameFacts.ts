/**
 * Batch 7 (W8): the literal meaning of each Nakshatra's NAME and its presiding deity,
 * for the /baby-names/nakshatra/:slug pages.
 *
 * Source (opened via WebFetch, 25 Oct 2026): Wikipedia, "Nakshatra" — the table of the
 * 27 nakshatras (columns: name, meaning/translation, associated stars, deity, symbol).
 * https://en.wikipedia.org/wiki/Nakshatra
 * The page notes that older texts sometimes swap the deities of the two Phalgunis
 * (Taittiriya Brahmana: Aryaman for Purva, Bhaga for Uttara); we show the table's
 * values and mention the swap on those two pages.
 */
export interface NakshatraNameFact { nameMeaning: string; deity: string; stars: string }

export const NAKSHATRA_NAME_FACTS: Record<string, NakshatraNameFact> = {
  Ashwini:             { nameMeaning: 'the horsemen',             deity: 'the Ashvins',            stars: 'β and γ Arietis' },
  Bharani:             { nameMeaning: 'the bearer',               deity: 'Yama',                   stars: '35, 39 and 41 Arietis' },
  Krittika:            { nameMeaning: 'to cut',                   deity: 'Agni',                   stars: 'the Pleiades' },
  Rohini:              { nameMeaning: 'the radiant maiden',       deity: 'Prajapati',              stars: 'Aldebaran' },
  Mrigashira:          { nameMeaning: "the deer's head",          deity: 'Soma',                   stars: 'λ and φ Orionis' },
  Ardra:               { nameMeaning: 'the moist one',            deity: 'Rudra',                  stars: 'Betelgeuse' },
  Punarvasu:           { nameMeaning: 'return of the light',      deity: 'Aditi',                  stars: 'Castor and Pollux' },
  Pushya:              { nameMeaning: 'the nourisher',            deity: 'Brihaspati',             stars: 'γ, δ and θ Cancri' },
  Ashlesha:            { nameMeaning: 'the embrace',              deity: 'the Nagas',              stars: 'δ, ε, η, ρ and σ Hydrae' },
  Magha:               { nameMeaning: 'the mighty',               deity: 'the Pitrs (ancestors)',  stars: 'Regulus' },
  'Purva Phalguni':    { nameMeaning: 'the former reddish one',   deity: 'Bhaga',                  stars: 'δ and θ Leonis' },
  'Uttara Phalguni':   { nameMeaning: 'the latter reddish one',   deity: 'Aryaman',                stars: 'Denebola' },
  Hasta:               { nameMeaning: 'the hand',                 deity: 'Savitr',                 stars: 'α, β, γ, δ and ε Corvi' },
  Chitra:              { nameMeaning: 'the bright one',           deity: 'Tvashtar / Vishwakarma', stars: 'Spica' },
  Swati:               { nameMeaning: 'the independent one',      deity: 'Vayu',                   stars: 'Arcturus' },
  Vishakha:            { nameMeaning: 'branching out',            deity: 'Indra and Agni',         stars: 'α, β, γ and ι Librae' },
  Anuradha:            { nameMeaning: 'following Radha',          deity: 'Mitra',                  stars: 'β, δ and π Scorpii' },
  Jyeshtha:            { nameMeaning: 'the eldest',               deity: 'Indra',                  stars: 'α, σ and τ Scorpii' },
  Mula:                { nameMeaning: 'the root',                 deity: 'Nirriti',                stars: 'ε, ζ, η, θ, ι, κ, λ, μ and ν Scorpii' },
  'Purva Ashadha':     { nameMeaning: 'the former unconquered',   deity: 'Apah (the waters)',      stars: 'δ and ε Sagittarii' },
  'Uttara Ashadha':    { nameMeaning: 'the latter unconquered',   deity: 'the Vishvedevas',        stars: 'ζ and σ Sagittarii' },
  Shravana:            { nameMeaning: 'to hear',                  deity: 'Vishnu',                 stars: 'α, β and γ Aquilae' },
  Dhanishtha:          { nameMeaning: 'the wealthiest',           deity: 'the Vasus',              stars: 'α, β, γ and δ Delphini' },
  Shatabhisha:         { nameMeaning: 'a hundred physicians',     deity: 'Varuna',                 stars: 'λ Aquarii' },
  'Purva Bhadrapada':  { nameMeaning: 'the former blessed feet',  deity: 'Aja Ekapada',            stars: 'α and β Pegasi' },
  'Uttara Bhadrapada': { nameMeaning: 'the latter blessed feet',  deity: 'Ahirbudhnya',            stars: 'γ Pegasi and α Andromedae' },
  Revati:              { nameMeaning: 'prosperous',               deity: 'Pushan',                 stars: 'ζ Piscium' },
};

export const NAKSHATRA_FACTS_SOURCE = { label: 'Wikipedia — Nakshatra (table of the 27 nakshatras)', url: 'https://en.wikipedia.org/wiki/Nakshatra' };
