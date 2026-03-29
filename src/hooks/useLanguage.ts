import { useState, useCallback } from 'react';
import { type Language, translations, type Translations } from '../utils/i18n';

const STORAGE_KEY = 'shard-language';

function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    // ignore
  }
  return 'en';
}

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: Language = prev === 'en' ? 'fa' : 'en';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const t: Translations = translations[language];
  const isRTL = language === 'fa';

  return { language, toggleLanguage, t, isRTL };
}
