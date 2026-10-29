/** Round-2 test panel (scratchpad round2/CONTEXT.md) as UTC birth instants, plus PyJHora's Chennai test chart. */
export const PANEL: Record<string, { t: Date; lat: number; lon: number }> = {
  P1: { t: new Date(Date.UTC(1996, 7, 31, 7, 34)), lat: 26.8467, lon: 80.9462 },   // Lucknow 13:04 IST
  P2: { t: new Date(Date.UTC(1999, 11, 3, 16, 3)), lat: 42.6389, lon: -83.2910 },  // Pontiac MI 11:03 EST
  P3: { t: new Date(Date.UTC(1990, 0, 15, 1, 0)), lat: 28.6139, lon: 77.2090 },    // New Delhi 06:30 IST
  P5: { t: new Date(Date.UTC(1992, 5, 10, 13, 20)), lat: 51.5074, lon: -0.1278 },  // London 14:20 BST
  P9: { t: new Date(Date.UTC(1978, 4, 13, 14, 0)), lat: 32.7266, lon: 74.8570 },   // Jammu 19:30 IST
  P10: { t: new Date(Date.UTC(2024, 2, 10, 3, 45)), lat: 12.9716, lon: 77.5946 },  // Bengaluru 09:15 IST
  CH: { t: new Date(Date.UTC(1996, 11, 7, 5, 4)), lat: 13.0878, lon: 80.2785 },    // Chennai 10:34 IST (PyJHora test chart)
};
