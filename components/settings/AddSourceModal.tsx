'use client';

import { useAddSourceForm } from './hooks/useAddSourceForm';
import { ModalBackdrop } from '@/components/ui/ModalBackdrop';
import { ModalHeader } from '@/components/ui/ModalHeader';
import type { VideoSource } from '@/lib/types';

const inputProps = {
  spellCheck: false,
  autoCorrect: 'off' as const,
  autoCapitalize: 'off' as const,
  autoComplete: 'off' as const,
  'data-form-type': 'other',
  'data-lpignore': 'true',
  lang: 'en',
  translate: 'no' as const,
};

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (source: VideoSource) => void;
  existingIds: string[];
  initialValues?: VideoSource | null;
}

export function AddSourceModal({ isOpen, onClose, onAdd, existingIds, initialValues }: AddSourceModalProps) {
  const { name, setName, customId, setCustomId, url, setUrl, error, handleSubmit, isEditing } = useAddSourceForm({
    isOpen,
    existingIds,
    onAdd,
    onClose,
    initialValues,
  });

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop isOpen={isOpen} onClose={onClose} />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 z-modal w-modal max-w-md -translate-x-1/2 transition-all duration-300 ${isOpen
          ? 'opacity-100 -translate-y-1/2 scale-100'
          : 'opacity-0 -translate-y-2/5 scale-95 pointer-events-none'
          }`}
      >
        <div className="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-overlay p-6">
          <ModalHeader title={initialValues ? "编辑视频源" : "添加自定义源"} onClose={onClose} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="source-name" className="block mb-2 font-medium text-text">
                源名称
              </label>
              <input
                id="source-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：新视频源"
                {...inputProps}
                className="w-full bg-surface backdrop-blur-md border border-border rounded-2xl px-4 py-3 text-text placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all duration-400"
              />
            </div>

            <div>
              <label htmlFor="source-id" className="block mb-2 font-medium text-text">
                源 ID
              </label>
              <input
                id="source-id"
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="自动生成，可手动修改"
                disabled={isEditing}
                {...inputProps}
                className="w-full bg-surface backdrop-blur-md border border-border rounded-2xl px-4 py-3 text-text placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all duration-400 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-text-secondary">
                用于唯一标识此源，仅支持小写字母、数字和连字符
              </p>
            </div>

            <div>
              <label htmlFor="source-url" className="block mb-2 font-medium text-text">
                接口地址
              </label>
              <input
                id="source-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api.php/provide/vod"
                {...inputProps}
                className="w-full bg-surface backdrop-blur-md border border-border rounded-2xl px-4 py-3 text-text placeholder:text-text-secondary focus:outline-none focus:border-primary transition-all duration-400"
              />
            </div>

            {error && (
              <div className="text-sm text-danger bg-danger/8 rounded-2xl px-4 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-2xl bg-surface border border-border text-text font-semibold hover:bg-text/10 transition-all duration-200"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:brightness-110 hover:-translate-y-0.5 shadow-card transition-all duration-200"
              >
                {initialValues ? "保存" : "添加"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
