import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  children,
  className = '',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center px-4 py-2.5 md:px-6 md:py-3 font-semibold text-sm md:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-touch touch-manipulation cursor-pointer";

  const variants = {
    primary: `
      bg-primary
      text-white 
      border-none 
      rounded-2xl
      shadow-soft
      hover:brightness-110 
      hover:shadow-card-hover
      active:scale-98
      active:brightness-95
    `,
    secondary: `
      bg-surface 
      backdrop-blur-glass backdrop-saturate-glass
      border 
      border-border
      rounded-2xl
      text-text
      shadow-soft
      hover:shadow-card-hover
      active:scale-98
    `,
    ghost: `
      bg-transparent
      text-text
      hover:bg-border
      active:scale-98
    `,
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
