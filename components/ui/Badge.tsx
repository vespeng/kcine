import React, { memo } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const BadgeComponent = memo(function Badge({
  children,
  variant = 'primary',
  className = '',
  icon,
  iconPosition = 'left'
}: BadgeProps) {
  const variants = {
    primary: "bg-primary text-white shadow-card",
    secondary: "bg-surface border border-border text-text",
  };

  const iconElement = icon && (
    <span
      className={`inline-flex items-center justify-center transform-gpu w-3.5 h-3.5 ${iconPosition === 'left' ? 'mr-1' : 'ml-1'
        }`}
    >
      {icon}
    </span>
  );

  return (
    <span
      className={`
        inline-flex items-center justify-center
        px-1.5 py-0.5
        rounded-full
        text-2xs font-semibold
        transform-gpu
        ${variants[variant]}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && iconElement}
      {children}
      {icon && iconPosition === 'right' && iconElement}
    </span>
  );
});

// Export both named and default for compatibility
export const Badge = BadgeComponent;


