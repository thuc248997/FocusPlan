import React, { createContext, useContext } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const GoogleAuthContext = createContext<ReturnType<typeof useGoogleAuth> | null>(null);

export const GoogleAuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const value = useGoogleAuth();
  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>;
};

export const useGoogleAuthContext = () => {
  const context = useContext(GoogleAuthContext);
  if (!context) {
    throw new Error('useGoogleAuthContext must be used within GoogleAuthProvider');
  }
  return context;
};
