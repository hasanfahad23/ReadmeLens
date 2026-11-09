import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-500/20 active:scale-[0.98]',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/80',
      outline: 'border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/60',
      ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white',
      danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-sm shadow-rose-500/20',
    };

    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-9 px-4 text-sm rounded-lg gap-2',
      lg: 'h-11 px-6 text-base rounded-xl gap-2.5',
      icon: 'h-9 w-9 rounded-lg flex items-center justify-center p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
