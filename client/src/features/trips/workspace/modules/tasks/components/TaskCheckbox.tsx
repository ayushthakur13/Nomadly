import { Icon } from '@/ui/icon/';

interface TaskCheckboxProps {
  checked: boolean;
  disabled: boolean;
  loading?: boolean;
  onChange: (checked: boolean) => void;
}

export default function TaskCheckbox({ checked, disabled, loading, onChange }: TaskCheckboxProps) {
  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.checked)}
        className={`
          w-5 h-5 rounded border-2 cursor-pointer
          transition-all duration-150 ease-in-out
          ${checked ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'}
          ${!disabled && !loading ? 'hover:border-emerald-500' : ''}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
          active:scale-95
        `}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="loader" size={14} className="animate-spin text-emerald-600" />
        </div>
      )}
    </div>
  );
}
