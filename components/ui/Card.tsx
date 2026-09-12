import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  blur?: boolean;
  padded?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', hover = true, blur = true, padded = true, onClick, style }: CardProps) {
  const hoverStyles = hover
    ? "hover:-translate-y-0.5 hover:shadow-card-hover cursor-pointer transition-transform duration-200 ease-out"
    : "";

  // Conditionally apply glass classes (Apple-style translucent surface)
  const blurClasses = blur
    ? "bg-surface backdrop-blur-md backdrop-saturate-glass"
    : "bg-bg/90"; // More opaque fallback

  const baseClasses = `
    ${blurClasses}
    rounded-2xl
    shadow-none
    border
    border-border
    ${padded ? 'p-4 md:p-6' : ''}
    relative
    ${hoverStyles}
    ${className}
  `;

  // Use semantic button when interactive
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} text-left w-full`}
        style={style}
      >
        {children}
      </button>
    );
  }

  // Use div for non-interactive cards
  return (
    <div className={baseClasses} style={style}>
      {children}
    </div>
  );
}
