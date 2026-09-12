/**
 * Reusable modal backdrop component
 */

interface ModalBackdropProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ModalBackdrop({ isOpen, onClose }: ModalBackdropProps) {
    return (
        <div
            className={`fixed inset-0 z-backdrop bg-black/30 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            onClick={onClose}
        />
    );
}
