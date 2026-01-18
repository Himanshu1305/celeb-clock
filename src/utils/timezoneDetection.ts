/**
 * Timezone Detection Utility
 * All calculations run CLIENT-SIDE in the user's browser.
 * No data is sent to any server for age calculations.
 */

export interface TimezoneInfo {
  timezone: string;
  offset: string;
  offsetMinutes: number;
}

/**
 * Automatically detects the user's timezone using browser APIs
 * All detection happens in the user's browser - no server calls
 */
export const detectUserTimezone = (): TimezoneInfo => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();
  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60);
  const offsetMins = Math.abs(offsetMinutes) % 60;
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  const offset = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMins).padStart(2, '0')}`;

  return {
    timezone,
    offset,
    offsetMinutes
  };
};

/**
 * Calculates age based on user's local timezone
 * All calculations happen CLIENT-SIDE in the browser
 */
export const calculateAgeInTimezone = (birthDate: Date): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} => {
  // Using user's local time from browser
  const now = new Date();
  const birth = new Date(birthDate);
  
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const timeDiff = now.getTime() - birth.getTime();
  const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays };
};
