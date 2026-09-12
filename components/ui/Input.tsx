import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 md:px-5 md:py-3
            text-base md:text-text
            bg-surface
            backdrop-blur-input backdrop-saturate-150
            border
            border-border
            rounded-2xl
            text-text
            placeholder:text-text-secondary
            focus:outline-none
            focus:border-primary
            transition-all
            duration-300
            touch-manipulation
            ${error ? 'border-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-danger-light">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

