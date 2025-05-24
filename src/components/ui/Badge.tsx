import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-blue-600 text-white',
      secondary: 'bg-gray-100 text-gray-900',
      destructive: 'bg-red-600 text-white',
      outline: 'border border-gray-300 text-gray-700 bg-transparent',
      success: 'bg-green-600 text-white',
      warning: 'bg-yellow-500 text-yellow-900'
    };

    return (
      <span
        className={clsx(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };