import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../context/I18nContext';

// Same visual shell as Select.jsx (wrapped native <select> + chevron), plus a small globe
// icon since this sits alone in a header rather than under a FormField label.
export default function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className={`language-switcher ${className}`.trim()}>
      <Globe size={14} className="language-switcher-icon" />
      <div className="select-wrap">
        <select
          className="form-field-input select-input language-switcher-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label={t('languageSwitcher.label')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
        <ChevronDown className="select-chevron" size={14} />
      </div>
    </div>
  );
}
