import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BirthDateContextType {
  birthDate: Date | null;
  setBirthDate: (date: Date | null) => void;
}

const BirthDateContext = createContext<BirthDateContextType | undefined>(undefined);

export const BirthDateProvider = ({ children }: { children: ReactNode }) => {
  const [birthDate, setBirthDateState] = useState<Date | null>(null);

  useEffect(() => {
    // Clear any previously persisted DOB — we no longer store health data in localStorage
    try { localStorage.removeItem('bornclock-birthdate'); } catch {}
  }, []);

  const setBirthDate = (date: Date | null) => {
    setBirthDateState(date);
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
