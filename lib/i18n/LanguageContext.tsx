'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, SupportedLanguage } from './translations';
import { formatDigits as formatDigitsUtil } from '@/lib/bengali-utils';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: typeof translations['bn'];
  formatDigits: (num: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'roktodata_lang';

const getStoredLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'bn';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'bn' || stored === 'en') return stored;
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return 'bn';
};

const subscribeLanguage = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('roktodata_lang_change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('roktodata_lang_change', callback);
    window.removeEventListener('storage', callback);
  };
};

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}> = ({ children, initialLanguage = 'bn' }) => {
  const language = React.useSyncExternalStore(
    subscribeLanguage,
    getStoredLanguage,
    () => initialLanguage
  );

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // Ignore storage errors
      }
      window.dispatchEvent(new CustomEvent('roktodata_lang_change', { detail: newLang }));
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const formatDigits = useCallback(
    (num: number | string) => formatDigitsUtil(num, language),
    [language]
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language],
    formatDigits,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for SSR or components rendered outside provider
    return {
      language: 'bn',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations.bn,
      formatDigits: (num) => formatDigitsUtil(num, 'bn'),
    };
  }
  return context;
};
