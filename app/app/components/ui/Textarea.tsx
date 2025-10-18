import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'w-full rounded-xl border bg-white text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-gray-300 focus:ring-green-500 focus:border-green-500',
        error: 'border-red-400 focus:ring-red-500 focus:border-red-500',
      },
      hasIcon: {
        true: 'pl-11 pr-4 py-3',
        false: 'px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      hasIcon: false,
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  icon?: React.ReactNode;
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, hasIcon, icon, error, ...props }, ref) => {
    const textareaVariant = error ? 'error' : variant;

    return (
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
            <div className="text-gray-400">{icon}</div>
          </div>
        )}
        <textarea
          ref={ref}
          className={textareaVariants({
            variant: textareaVariant,
            hasIcon: !!icon,
            className
          })}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
