// --- Kaal Sarp Dosha: complete classification (full/partial + 12 types) ---
// Verified: present/isPartial/type all match AstrologyAPI.com exactly on
// 2 independent test charts. Direction (Ascending/Descending) label
// verified against 2 real data points and found to be the OPPOSITE of
// what a literal reading of some research sources suggested - i.e. when
// planets sit in the KETU-to-RAHU arc (not Rahu-to-Ketu), AstrologyAPI
// calls this "Ascending", confirmed on both a partial and a full example.

function normalize360(deg) { return ((deg % 360) + 360) % 360; }

const KAAL_SARP_TYPES = {
  1: 'Anant', 2: 'Kulik', 3: 'Vasuki', 4: 'Shankhpal', 5: 'Padma', 6: 'Mahapadma',
  7: 'Takshak', 8: 'Karkotak', 9: 'Shankhnaad', 10: 'Patak', 11: 'Vishdhar', 12: 'Sheshnag',
};

function getKaalSarpDetails(chart) {
  const rahuSign = chart.planets.Rahu.rashiIndex;
  const ketuSign = chart.planets.Ketu.rashiIndex;
  const classical = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

  function signInArc(sign, startSign, endSign) {
    const arcLen = normalize360(endSign * 30 - startSign * 30) / 30;
    const pos = normalize360(sign * 30 - startSign * 30) / 30;
    return pos <= arcLen;
  }

  const inRahuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, rahuSign, ketuSign));
  const inKetuArc = classical.map(n => signInArc(chart.planets[n].rashiIndex, ketuSign, rahuSign));
  const rahuArcCount = inRahuArc.filter(Boolean).length;
  const ketuArcCount = inKetuArc.filter(Boolean).length;

  const isFullRahu = rahuArcCount === 7;
  const isFullKetu = ketuArcCount === 7;
  const isPartialRahu = rahuArcCount === 6;
  const isPartialKetu = ketuArcCount === 6;

  const lagnaSignIdx = chart.lagna.rashiIndex;
  const rahuHouse = ((rahuSign - lagnaSignIdx + 12) % 12) + 1;
  const type = KAAL_SARP_TYPES[rahuHouse];

  // Direction labels verified against 2 real AstrologyAPI data points:
  // Ketu-arc configurations = "Ascending", Rahu-arc configurations = "Descending"
  if (isFullRahu || isFullKetu) {
    return { present: true, isPartial: false, type, direction: isFullKetu ? 'Ascending' : 'Descending' };
  }
  if (isPartialRahu || isPartialKetu) {
    return { present: true, isPartial: true, type, direction: isPartialKetu ? 'Ascending' : 'Descending' };
  }
  return { present: false, isPartial: false, type: null, direction: null };
}

module.exports = { getKaalSarpDetails, KAAL_SARP_TYPES };
