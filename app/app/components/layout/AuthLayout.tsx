import React from 'react';
import { Header } from './Header';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ title = 'DogTrain', subtitle = 'Área do Cliente', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-gray-50 min-h-screen flex flex-col ${className || ''}`}
        {...props}
      >
        <Header title={title} subtitle={subtitle} />
        
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
        
        <nav className="bg-white border-t border-gray-200 py-2">
          <div className="flex justify-between items-center px-4">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} DogTrain. Todos os direitos reservados.</p>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    );
  }
);

AuthLayout.displayName = 'AuthLayout';