import { useState, useEffect } from 'react';

/**
 * Age Calculator Hook
 *
 * IMPORTANT: All calculations run CLIENT-SIDE in the user's browser using JavaScript.
 * No data is sent to any server for age calculations.
 *
 * This hook automatically detects the user's timezone from their browser
 * and calculates age accordingly using the browser's Date API.
 */

export interface AgeData {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export const useAgeCalculator = (birthDate: Date | null) => {
  const [ageData, setAgeData] = useState<AgeData | null>(null);

  useEffect(() => {
    if (!birthDate) {
      setAgeData(null);
      return;
    }

    const calculateAge = () => {
      const now = new Date();
      const birth = new Date(birthDate);

      // Total elapsed milliseconds — source of truth for all "total" counters
      const diffMs = now.getTime() - birth.getTime();

      const totalSeconds = Math.floor(diffMs / 1000);
      const totalMinutes = Math.floor(diffMs / 60000);
      const totalHours   = Math.floor(diffMs / 3600000);
      const totalDays    = Math.floor(diffMs / 86400000);

      // Breakdown: years / months / days / hours / minutes / seconds
      // Computed from calendar date/time components so they reflect the
      // human-readable "age since birthday" rather than raw elapsed ms.
      let years   = now.getFullYear() - birth.getFullYear();
      let months  = now.getMonth()    - birth.getMonth();
      let days    = now.getDate()     - birth.getDate();
      // Use elapsed-ms seconds/minutes/hours for the sub-day breakdown so
      // these always stay in sync with totalSeconds and advance every second.
      const seconds = totalSeconds % 60;
      const minutes = totalMinutes % 60;
      const hours   = totalHours   % 24;

      if (days < 0) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
        months -= 1;
      }
      if (months < 0) {
        months += 12;
        years  -= 1;
      }

      setAgeData({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        totalDays,
        totalHours,
        totalMinutes,
        totalSeconds,
      });
    };

    calculateAge(); // run immediately on mount
    const interval = setInterval(calculateAge, 1000);
    return () => clearInterval(interval);
  }, [birthDate]);

  return ageData;
};
