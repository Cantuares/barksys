import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'w-full rounded-lg border border-gray-300 bg-white text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
        error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
      },
      hasIcon: {
        true: 'pl-10',
        false: 'pl-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      hasIcon: false,
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, hasIcon, icon, error, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;
    
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        <input
          ref={ref}
          className={inputVariants({ 
            variant: inputVariant, 
            hasIcon: !!icon, 
            className 
          })}
          style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';