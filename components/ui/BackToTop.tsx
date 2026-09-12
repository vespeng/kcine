'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

/**
 * BackToTop - Floating button to scroll back to top of page
 * Follows Liquid Glass design system
 */
export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Show button after scrolling down 300px
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });

        // Initial check in case page is already scrolled (e.g. on refresh)
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            className={`fixed bottom-8 right-8 z-modal p-3 rounded-full 
                        bg-surface border border-border 
                        shadow-overlay backdrop-blur-xl 
                        text-text transition-all duration-300 ease-out
                        hover:bg-primary/15 
                        hover:scale-110 active:scale-95
                        ${isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
                }`}
            aria-label="返回顶部"
            title="返回顶部"
        >
            <ChevronUp size={24} strokeWidth={2.5} />
        </button>
    );
}
