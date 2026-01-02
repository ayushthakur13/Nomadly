import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  error?: string | null;
  title?: string;
  onDismiss?: () => void;
}

const ErrorAlert = ({ error, title = 'Something went wrong', onDismiss }: ErrorAlertProps) => {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3">
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="text-sm">{error}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 flex-shrink-0"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;
