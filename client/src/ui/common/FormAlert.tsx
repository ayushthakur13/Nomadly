import { ReactNode } from 'react';
import { Icon } from '../icon';

export type FormAlertVariant = 'error' | 'warning' | 'info' | 'success';

interface FormAlertProps {
  show: boolean;
  message?: string;
  children?: ReactNode;
  variant?: FormAlertVariant;
  className?: string;
  onDismiss?: () => void;
}

const VARIANT_MAPS = {
  error: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    iconColor: 'text-red-600',
    iconName: 'alertCircle' as const,
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    iconColor: 'text-amber-600',
    iconName: 'alertCircle' as const,
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    iconColor: 'text-blue-600',
    iconName: 'alertCircle' as const,
  },
  success: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-700',
    iconColor: 'text-emerald-600',
    iconName: 'alertCircle' as const,
  },
};

const FormAlert = ({
  show,
  message,
  children,
  variant = 'error',
  className = '',
  onDismiss,
}: FormAlertProps) => {
  if (!show) return null;

  const style = VARIANT_MAPS[variant];

  return (
    <div
      className={`flex items-start gap-3 p-3 border rounded-lg animate-fadeIn ${style.bg} ${style.text} ${className}`}
    >
      <Icon
        name={style.iconName}
        size={16}
        className={`${style.iconColor} flex-shrink-0 mt-0.5`}
      />
      <div className="flex-1 min-w-0 text-sm font-medium leading-5">
        {children || message}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={`${style.iconColor} hover:opacity-80 ml-2 flex-shrink-0 transition-opacity`}
        >
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  );
};

export default FormAlert;
