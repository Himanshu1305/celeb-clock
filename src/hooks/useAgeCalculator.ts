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
      // Using browser's Date API - automatically uses user's local timezone
      const now = new Date();
      const birth = new Date(birthDate);
      
      // Calculate exact age
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      let hours = now.getHours() - birth.getHours();
      let minutes = now.getMinutes() - birth.getMinutes();
      let seconds = now.getSeconds() - birth.getSeconds();

      // Adjust for negative values
      if (seconds < 0) {
        seconds += 60;
        minutes -= 1;
      }
      if (minutes < 0) {
        minutes += 60;
        hours -= 1;
      }
      if (hours < 0) {
        hours += 24;
        days -= 1;
      }
      if (days < 0) {
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
        months -= 1;
      }
      if (months < 0) {
        months += 12;
        years -= 1;
      }

      // Calculate totals
      const timeDiff = now.getTime() - birth.getTime();
      const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
      const totalMinutes = Math.floor(timeDiff / (1000 * 60));
      const totalSeconds = Math.floor(timeDiff / 1000);

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
        totalSeconds
      });
    };

    calculateAge();
    const interval = setInterval(calculateAge, 1000);

    return () => clearInterval(interval);
  }, [birthDate]);

  return ageData;
};