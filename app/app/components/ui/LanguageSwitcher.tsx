import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'pt-PT', label: 'Português', flag: '🇵🇹' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        aria-label="Change language"
      >
        <Globe className="h-5 w-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-sm transition-colors',
                i18n.language === lang.code
                  ? 'bg-green-50 text-green-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {i18n.language === lang.code && (
                <Check className="h-4 w-4 text-green-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
