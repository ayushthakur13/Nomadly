import { calculatePasswordStrength, getPasswordStrengthInfo } from "../validators/authValidators";

interface PasswordStrengthMeterProps {
  password: string;
}

export default function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);
  const { label, barColor, textColor } = getPasswordStrengthInfo(strength);

  return (
    <div className="mt-2" aria-live="polite">
      <div
        className="h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={strength}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Password strength"
      >
        <div
          className={`h-2 ${barColor} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${strength}%` }}
        />
      </div>
      <p className={`mt-1 text-xs ${textColor}`}>
        Strength: {label}
      </p>
    </div>
  );
}
