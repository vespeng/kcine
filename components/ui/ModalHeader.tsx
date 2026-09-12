/**
 * Reusable modal header component
 */

interface ModalHeaderProps {
    title: string;
    onClose: () => void;
}

export function ModalHeader({ title, onClose }: ModalHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text">
                {title}
            </h3>
            <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border text-text hover:bg-primary/10 transition-all duration-200 cursor-pointer"
                aria-label="关闭"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
