import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from '../locales/en.json';
import ha from '../locales/ha.json';
import yo from '../locales/yo.json';
import ig from '../locales/ig.json';
import pcm from '../locales/pcm.json';

// A deliberately tiny i18n layer instead of pulling in react-i18next/i18next (that's a real
// dependency + runtime for what's currently 5 small JSON files) — dot-path lookup with
// {{var}} interpolation and an English fallback for any key missing from the active locale.
const LOCALE_KEY = 'hrat-language';
const DEFAULT_LANGUAGE = 'en';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ha', label: 'Hausa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'ig', label: 'Igbo' },
  { code: 'pcm', label: 'Pidgin' },
];

const LOCALES = { en, ha, yo, ig, pcm };

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{\{(\w+)\}\}/g, (match, name) => (Object.prototype.hasOwnProperty.call(vars, name) ? vars[name] : match));
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(LOCALE_KEY) : null;
    return LOCALES[saved] ? saved : DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((code) => {
    if (!LOCALES[code]) return;
    setLanguageState(code);
    window.localStorage.setItem(LOCALE_KEY, code);
  }, []);

  const t = useCallback((key, vars) => {
    const active = LOCALES[language] || LOCALES[DEFAULT_LANGUAGE];
    const value = getPath(active, key) ?? getPath(LOCALES[DEFAULT_LANGUAGE], key);
    if (value == null) return key;
    return typeof value === 'string' ? interpolate(value, vars) : value;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within an I18nProvider');
  return ctx;
}
