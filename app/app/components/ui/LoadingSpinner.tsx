import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', text, className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    return (
      <div
        ref={ref}
        className={`flex items-center justify-center ${className || ''}`}
        {...props}
      >
        <Loader2 className={`animate-spin ${sizeClasses[size]} text-primary-500`} />
        {text && (
          <span className="ml-2 text-sm text-gray-600">{text}</span>
        )}
      </div>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';