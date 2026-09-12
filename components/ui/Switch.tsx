'use client';

/**
 * Switch - A reusable toggle switch component
 * Following Liquid Glass design system
 */

import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    ariaLabel?: string;
    className?: string;
    disabled?: boolean;
}

export function Switch({
    checked,
    onChange,
    ariaLabel,
    className = "",
    disabled = false,
}: SwitchProps) {
    return (
        <label
            className={`
        switch relative inline-flex items-center cursor-pointer 
        h-7.5 w-12 shrink-0
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
        >
            <input
                type="checkbox"
                className="sr-only peer"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                aria-label={ariaLabel}
                disabled={disabled}
            />
            <div
                className={`
          switch-slider w-full h-full rounded-full 
          bg-text/20 
          peer-checked:bg-primary 
          transition-colors duration-400 ease-fluid
          before:content-[''] before:absolute before:h-6.5 before:w-6.5 
          before:left-0.5 before:bottom-0.5 
          before:bg-white before:rounded-full 
          before:transition-transform before:duration-400 
          before:ease-fluid
          before:shadow-sm 
          peer-checked:before:translate-x-5
          active:before:scale-95
        `}
            ></div>
        </label>
    );
}
