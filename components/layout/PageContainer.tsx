import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** Max width preset: 'content' = 1240px (home/premium), 'wide' = 1280px (favorites) */
  size?: 'content' | 'wide';
  /** Extra classes, e.g. vertical padding, spacing */
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PageContainerProps['size']>, string> = {
  content: 'max-w-[1240px]',
  wide: 'max-w-7xl',
};

/**
 * Shared content area container: centered column with horizontal padding.
 * All pages use this so the content area keeps one consistent code path.
 */
export function PageContainer({
  children,
  size = 'content',
  className = '',
}: PageContainerProps) {
  return (
    <main className={[SIZE_CLASSES[size], 'mx-auto px-4', className].filter(Boolean).join(' ')}>
      {children}
    </main>
  );
}
