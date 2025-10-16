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
    <div className={cn('bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-5 text-white', className)}>
      <h2 className="font-bold text-xl mb-2">{title}</h2>
      <p className="text-primary-100 mb-4">{description}</p>
      {buttonText && onButtonClick && (
        <button 
          className="bg-white text-primary-600 font-medium py-2 px-4 rounded-lg text-sm hover:bg-primary-50 transition-colors"
          onClick={onButtonClick}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};
