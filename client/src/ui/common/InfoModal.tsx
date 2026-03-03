import { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../icon/Icon';

type InfoModalSize = 'sm' | 'md';

const SIZE_CLASSES: Record<InfoModalSize, { panel: string; body: string }> = {
  sm: { panel: 'max-w-sm', body: 'max-h-80' },
  md: { panel: 'max-w-md', body: 'max-h-[60vh]' },
};

interface InfoModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** Controls panel width and body max-height. Defaults to 'sm'. */
  size?: InfoModalSize;
}

/**
 * Generic informational overlay — same backdrop / animation atoms as ConfirmationModal.
 * Pass size="md" for larger / interactive content (e.g. member lists with inputs).
 */
const InfoModal = ({ isOpen, title, subtitle, onClose, children, size = 'sm' }: InfoModalProps) => {
  if (!isOpen) return null;

  const { panel, body } = SIZE_CLASSES[size];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-modal-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${panel} animate-modal-slide-up`}>
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className={`px-6 py-4 ${body} overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InfoModal;
