"use client";

import React, { createContext, useContext, ReactNode, useState, Dispatch, SetStateAction } from 'react';

interface ShuffleContextProps {
  isShuffling: boolean;
  setIsShuffling: Dispatch<SetStateAction<boolean>>;
}

const ShuffleContext = createContext<ShuffleContextProps | undefined>(undefined);

export const ShuffleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isShuffling, setIsShuffling] = useState(false);

  return (
    <ShuffleContext.Provider value={{ isShuffling, setIsShuffling }}>
      {children}
    </ShuffleContext.Provider>
  );
};

export const useShuffle = () => {
  const context = useContext(ShuffleContext);
  if (!context) {
    throw new Error('useShuffle must be used within a ShuffleProvider');
  }
  return context;
};
