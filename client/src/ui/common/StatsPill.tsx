import { ReactNode } from 'react';

interface StatsPillProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  variant?: 'emerald' | 'indigo' | 'amber' | 'red';
}

const variantClasses = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  red: 'bg-red-50 text-red-700 border-red-100',
};

const StatsPill = ({ label, value, icon, variant = 'emerald' }: StatsPillProps) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${variantClasses[variant]}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>
        {label} {value}
      </span>
    </span>
  );
};

export default StatsPill;
