import React, { createContext, useContext, useState } from 'react';
import AuthModal from '@/components/AuthModal';

interface AuthModalContextType {
  openAuthModal: (mode: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isOpen: boolean;
  mode: 'login' | 'register';
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};

interface AuthModalProviderProps {
  children: React.ReactNode;
}

export const AuthModalProvider = ({ children }: AuthModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('register');

  const openAuthModal = (mode: 'login' | 'register') => {
    setMode(mode);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isOpen, mode }}>
      {children}
      <AuthModal 
        isOpen={isOpen} 
        onClose={closeAuthModal} 
        initialMode={mode} 
      />
    </AuthModalContext.Provider>
  );
};