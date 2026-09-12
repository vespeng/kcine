'use client';

import { useRef, useEffect, useState } from 'react';

/**
 * SegmentedControl - A switch-style tab component following Liquid Glass design
 */

interface SegmentedControlProps<T extends string> {
    options: { label: string; value: T }[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className = '',
}: SegmentedControlProps<T>) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const updateIndicator = () => {
            if (!containerRef.current) return;
            const activeElement = containerRef.current.querySelector(
                `[data-value="${value}"]`
            ) as HTMLElement;

            if (activeElement) {
                setIndicatorStyle({
                    left: activeElement.offsetLeft,
                    width: activeElement.offsetWidth,
                });
            }
        };

        updateIndicator();
        // Update on window resize as well
        window.addEventListener('resize', updateIndicator);
        return () => window.removeEventListener('resize', updateIndicator);
    }, [value, options]);

    return (
        <div
            ref={containerRef}
            className={`
                relative flex p-1 bg-surface backdrop-blur-xl 
                border border-border rounded-2xl 
                shadow-card ${className}
            `}
        >
            {/* Sliding Indicator */}
            <div
                className="absolute top-1 bottom-1 bg-primary rounded-2xl-inset shadow-primary-glow-sm transition-all duration-300 ease-fluid"
                style={{
                    left: `${indicatorStyle.left}px`,
                    width: `${indicatorStyle.width}px`,
                }}
            />

            {/* Segment Buttons */}
            {options.map((option) => (
                <button
                    key={option.value}
                    data-value={option.value}
                    onClick={() => onChange(option.value)}
                    className={`
                        relative z-10 flex-1 py-2 px-4 text-sm font-semibold transition-colors duration-200
                        ${value === option.value ? 'text-white' : 'text-text-secondary hover:text-text'}
                    `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
