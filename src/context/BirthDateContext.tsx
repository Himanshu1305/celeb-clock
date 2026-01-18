import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BirthDateContextType {
  birthDate: Date | null;
  setBirthDate: (date: Date | null) => void;
}

const BirthDateContext = createContext<BirthDateContextType | undefined>(undefined);

const STORAGE_KEY = 'celeb-clock-birthdate';

export const BirthDateProvider = ({ children }: { children: ReactNode }) => {
  const [birthDate, setBirthDateState] = useState<Date | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = new Date(stored);
        // Validate the date
        if (!isNaN(parsed.getTime())) {
          return parsed;
        }
      }
    }
    return null;
  });

  const setBirthDate = (date: Date | null) => {
    setBirthDateState(date);
    // Persist to localStorage
    if (date) {
      localStorage.setItem(STORAGE_KEY, date.toISOString());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <BirthDateContext.Provider value={{ birthDate, setBirthDate }}>
      {children}
    </BirthDateContext.Provider>
  );
};

export const useBirthDate = (): BirthDateContextType => {
  const context = useContext(BirthDateContext);
  if (context === undefined) {
    throw new Error('useBirthDate must be used within a BirthDateProvider');
  }
  return context;
};
