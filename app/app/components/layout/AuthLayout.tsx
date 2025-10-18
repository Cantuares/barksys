import React from 'react';
import { Link } from 'react-router';
import { Dog } from 'lucide-react';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ title, subtitle, children, className, ...props }, ref) => {
    const { t } = useTranslation();

    return (
      <div
        ref={ref}
        className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex flex-col ${className || ''}`}
        {...props}
      >
        {/* Header */}
        <header className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 text-green-600 hover:text-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-2 -ml-2">
              <Dog className="h-7 w-7" />
              <span className="text-lg md:text-xl font-bold text-gray-900">{title || 'BarkSys'}</span>
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md animate-fade-in">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full px-6 py-8 border-t border-gray-200 bg-white/50">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-500">
            {t("home.footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </footer>
      </div>
    );
  }
);

AuthLayout.displayName = 'AuthLayout';
