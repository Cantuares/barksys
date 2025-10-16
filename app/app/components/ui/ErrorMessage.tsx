import React from 'react';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  variant?: 'error' | 'warning' | 'info';
}

export const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ message, variant = 'error', className, ...props }, ref) => {
    const variantClasses = {
      error: 'bg-red-50 border-red-200 text-red-600',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      info: 'bg-blue-50 border-blue-200 text-blue-600',
    };

    return (
      <div
        ref={ref}
        className={`p-3 border rounded-lg ${variantClasses[variant]} ${className || ''}`}
        {...props}
      >
        <p className="text-sm">{message}</p>
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';