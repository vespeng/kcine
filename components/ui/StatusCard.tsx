import type { ComponentType, ReactNode } from 'react';

export type StatusTone = 'primary' | 'warning' | 'danger' | 'success';

const TONE_CLASSES: Record<StatusTone, string> = {
  primary: 'bg-primary/10 text-primary',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
};

const WIDTH_CLASSES = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

interface StatusCardProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  tone?: StatusTone;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** 全屏居中展示（登录门、权限门、路由拦截） */
  fullscreen?: boolean;
  /** 是否渲染玻璃卡片容器；页面内联状态建议关闭，仅保留文本内容 */
  surface?: boolean;
  /** 卡片最大宽度 */
  width?: keyof typeof WIDTH_CLASSES;
  /** 图标旋转（加载/同步中） */
  busy?: boolean;
  /** 附加类名，如入场动画 */
  className?: string;
}

/**
 * 统一的状态卡片：告警、失败、权限与登录门共用同一套玻璃卡片样式
 */
export function StatusCard({
  icon: Icon,
  tone = 'primary',
  title,
  description,
  children,
  fullscreen = false,
  surface = true,
  width = 'md',
  busy = false,
  className = '',
}: StatusCardProps) {
  const card = (
    <div
      className={`w-full mx-auto ${WIDTH_CLASSES[width]} flex flex-col items-center gap-4 text-center ${
        surface ? 'bg-surface backdrop-blur-glass border border-border rounded-2xl p-6 shadow-overlay' : ''
      } ${className}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${surface ? 'border border-border shadow-card' : ''} ${TONE_CLASSES[tone]}`}
      >
        <Icon size={20} className={busy ? 'animate-spin' : undefined} />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-text">{title}</h2>
        {description && <div className="text-sm text-text-secondary">{description}</div>}
      </div>

      {children}
    </div>
  );

  if (!fullscreen) return card;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-bg bg-page text-text">
      <div className="w-full p-4 -translate-y-gate-shift">{card}</div>
    </div>
  );
}
