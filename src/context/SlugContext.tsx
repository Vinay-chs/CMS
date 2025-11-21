// src/context/SlugContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SlugContextType {
  baseSlug: string;
  getFullSlug: (componentSlug: string) => string;
}

const SlugContext = createContext<SlugContextType | undefined>(undefined);

export const SlugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseSlug, setBaseSlug] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('cms_base_slug');
    if (saved) {
      setBaseSlug(saved);
    }
  }, []);

  const getFullSlug = (componentSlug: string): string => {
    if (!baseSlug) return componentSlug;
    return `${baseSlug}/${componentSlug}`.replace(/^\/+/, '').replace(/\/+$/, '');
  };

  return (
    <SlugContext.Provider value={{ baseSlug, getFullSlug }}>
      {children}
    </SlugContext.Provider>
  );
};

export const useSlug = () => {
  const context = useContext(SlugContext);
  if (!context) throw new Error('useSlug must be used within SlugProvider');
  return context;
};