import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'pt-PT', label: 'Português' },
    { code: 'en', label: 'English' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={i18n.language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};
