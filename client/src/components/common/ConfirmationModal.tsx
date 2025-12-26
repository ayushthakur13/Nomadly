import { ReactNode } from 'react';
import Icon from '../icon/Icon';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

const ConfirmationModal = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onCancel}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal content */}
      <div 
        className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Content with padding */}
        <div className="px-8 py-8">
          {/* Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex-shrink-0 p-3 rounded-xl ${isDangerous ? 'bg-red-50' : 'bg-emerald-50'}`}>
              <Icon 
                name={isDangerous ? 'alertCircle' : 'checkCircle'} 
                size={24} 
                className={isDangerous ? 'text-red-600' : 'text-emerald-600'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {description}
          </p>

          {/* Custom children if provided */}
          {children && <div className="mb-6">{children}</div>}
        </div>

        {/* Footer with divider */}
        <div className="px-8 py-4 border-t border-gray-100 flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/20'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20'
            }`}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            <span>{isLoading ? 'Please wait...' : confirmText}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
