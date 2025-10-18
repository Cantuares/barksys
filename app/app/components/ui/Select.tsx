import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'w-full rounded-xl border bg-white text-base ring-offset-white focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px]',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-green-500 focus:border-green-500',
        error: 'border-red-400 focus:ring-red-500 focus:border-red-500',
      },
      hasIcon: {
        true: 'pl-11 pr-4',
        false: 'px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      hasIcon: false,
    },
  }
);

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, hasIcon, icon, error, children, ...props }, ref) => {
    const selectVariant = error ? 'error' : variant;

    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        <select
          ref={ref}
          className={selectVariants({
            variant: selectVariant,
            hasIcon: !!icon,
            className
          })}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
