/** round2/CONTEXT.md test panel P1–P10 (local time + the offset in force at that birth). */
import type { BirthChartInput } from '../../calculateBirthChart';

export const PANEL: Record<string, BirthChartInput> = {
  P1: { year: 1996, month: 8, day: 31, hour: 13, minute: 4, latitude: 26.8467, longitude: 80.9462, timezoneOffset: 5.5 },
  P2: { year: 1999, month: 12, day: 3, hour: 11, minute: 3, latitude: 42.6389, longitude: -83.2910, timezoneOffset: -5 },
  P3: { year: 1990, month: 1, day: 15, hour: 6, minute: 30, latitude: 28.6139, longitude: 77.2090, timezoneOffset: 5.5 },
  P4: { year: 1985, month: 7, day: 20, hour: 23, minute: 45, latitude: 19.0760, longitude: 72.8777, timezoneOffset: 5.5 },
  P5: { year: 1992, month: 6, day: 10, hour: 14, minute: 20, latitude: 51.5074, longitude: -0.1278, timezoneOffset: 1 },
  P6: { year: 2001, month: 12, day: 25, hour: 8, minute: 0, latitude: -33.8688, longitude: 151.2093, timezoneOffset: 11 },
  P7: { year: 2002, month: 5, day: 14, hour: 16, minute: 45, latitude: 40.5187, longitude: -74.4121, timezoneOffset: -4 },
  P8: { year: 1995, month: 2, day: 10, hour: 21, minute: 40, latitude: -37.8136, longitude: 144.9631, timezoneOffset: 11 },
  P9: { year: 1978, month: 5, day: 13, hour: 19, minute: 30, latitude: 32.7266, longitude: 74.8570, timezoneOffset: 5.5 },
  P10: { year: 2024, month: 3, day: 10, hour: 9, minute: 15, latitude: 12.9716, longitude: 77.5946, timezoneOffset: 5.5 },
};
