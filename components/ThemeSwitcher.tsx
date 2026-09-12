'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get the icon for the current theme
  const getCurrentIcon = () => {
    switch (theme) {
      case 'light':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        );
      case 'dark':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        );
      default: // system
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        );
    }
  };

  const themeOptions = [
    { value: 'light', label: '浅色模式', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    )},
    { value: 'dark', label: '深色模式', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    )},
    { value: 'system', label: '跟随系统', icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )},
  ];

  return (
    <div className="relative hidden sm:block" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center
          w-9 h-9 sm:w-10 sm:h-10
          rounded-full
          bg-surface
          backdrop-blur-glass backdrop-saturate-glass
          border border-border
          text-text
          hover:bg-primary/10
          transition-all duration-200
          cursor-pointer
          shadow-card
          ${isOpen ? 'ring-2 ring-primary/30' : ''}
        `}
        aria-label="切换主题"
        title="切换主题"
      >
        {getCurrentIcon()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute top-full right-0 mt-2
          min-w-menu
          bg-bg/95
          backdrop-blur-glass backdrop-saturate-glass
          border border-border
          rounded-2xl
          shadow-card
          p-1.5
          z-50
          animate-scale-in
        ">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value as 'light' | 'dark' | 'system');
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2
                text-sm
                rounded-lg
                transition-colors duration-150
                cursor-pointer
                ${theme === option.value
                  ? 'bg-primary/15 text-primary'
                  : 'text-text hover:bg-text/6'
                }
              `}
            >
              <span className={`flex-shrink-0 ${theme === option.value ? 'text-primary' : ''}`}>
                {option.icon}
              </span>
              <span>{option.label}</span>
              {theme === option.value && (
                <svg className="w-4 h-4 ml-auto text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
