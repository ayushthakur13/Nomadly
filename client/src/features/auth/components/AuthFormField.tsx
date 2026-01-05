import { forwardRef } from "react";

interface AuthFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
  ({ error, helperText, label, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          className={`w-full p-3 border border-gray-300 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className}`}
        />
        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-500 mt-1" aria-live="polite">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthFormField.displayName = "AuthFormField";

export default AuthFormField;
