import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
      secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500',
      outline: 'border border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-500',
      ghost: 'hover:bg-gray-100 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg',
    };
    
    const fullWidthClass = fullWidth ? 'w-full' : '';
    
    const finalClassName = `${baseClasses} ${variantClasses[variant || 'primary']} ${sizeClasses[size || 'md']} ${fullWidthClass} ${className || ''}`;
    
    return (
      <button
        ref={ref}
        className={finalClassName}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';