import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  /** 附加类名，如垂直内边距、区块间距 */
  className?: string;
}

/**
 * 内容区容器：最大宽 1920px 居中，左右内边距与顶栏一致。
 * 全部页面共用，保证内容区水平对齐统一。
 */
export function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <main className={['max-w-page w-full mx-auto px-6', className].filter(Boolean).join(' ')}>
      {children}
    </main>
  );
}
