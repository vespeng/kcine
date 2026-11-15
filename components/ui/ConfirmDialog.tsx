'use client';

import { useEffect, useRef } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  dangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'warning',
  dangerous = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelButtonRef.current?.focus();
      // 锁定实际滚动容器 html；scrollbar-gutter 已预留滚动条槽位，避免页面横向偏移
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-danger hover:bg-danger-dark',
    warning: 'bg-primary hover:brightness-110',
    info: 'bg-primary hover:brightness-110',
  };
  
  // Use dangerous prop to override variant
  const finalVariant = dangerous ? 'danger' : variant;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-backdrop bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        className="fixed top-1/2 left-1/2 z-modal w-modal max-w-md -translate-x-1/2 -translate-y-1/2 animate-slide-up"
      >
        <Card className="p-6">
          {/* Header */}
          <h2
            id="dialog-title"
            className="text-xl font-semibold text-text mb-3"
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="dialog-description"
            className="text-text-secondary mb-6 leading-relaxed"
          >
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              ref={cancelButtonRef}
              variant="secondary"
              onClick={onCancel}
              className="min-w-cta"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              className={`min-w-cta ${variantStyles[finalVariant]}`}
            >
              {confirmText}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
