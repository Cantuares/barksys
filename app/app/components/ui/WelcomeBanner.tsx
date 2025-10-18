import React from 'react';
import { cn } from '../../lib/utils';

interface WelcomeBannerProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  className
}) => {
  return (
    <div className={cn('bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white', className)}>
      <h2 className="text-xl md:text-2xl font-bold mb-2">{title}</h2>
      <p className="text-green-50 mb-4 text-base">{description}</p>
      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="inline-flex items-center justify-center px-4 py-3 text-base font-medium bg-white text-green-600 rounded-lg hover:bg-green-50 active:bg-green-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
