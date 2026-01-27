import { useState, useRef } from 'react';
import Icon from '@/components/icon/Icon';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface MenuAction {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ThreeDotMenuProps {
  actions: MenuAction[];
  visible?: boolean;
  loading?: boolean;
  size?: number;
  // Optional: for controlled usage
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function ThreeDotMenu({
  actions,
  visible = true,
  loading = false,
  size = 18,
  isOpen: controlledIsOpen,
  onOpenChange,
}: ThreeDotMenuProps) {
  // Self-contained state (used when not controlled)
  const [localIsOpen, setLocalIsOpen] = useState(false);
  
  // Use controlled or local state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;
  const setIsOpen = onOpenChange || setLocalIsOpen;

  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setIsOpen(false), isOpen);

  if (!visible || actions.length === 0) return null;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        title="More options"
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Icon name="moreVertical" size={size} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                disabled={action.disabled || loading}
                className={`
                  w-full text-left px-4 py-2 text-sm font-medium
                  flex items-center gap-3
                  transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                  ${
                    action.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <Icon
                  name={action.icon}
                  size={14}
                  className={action.variant === 'danger' ? 'text-red-400' : 'text-gray-400'}
                />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
