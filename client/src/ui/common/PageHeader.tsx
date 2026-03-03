import { ReactNode } from 'react';

interface ActionItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ActionItem;
  secondaryAction?: ActionItem;
}

const PageHeader = ({ title, subtitle, action, secondaryAction }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        {subtitle && (
          typeof subtitle === 'string'
            ? <p className="text-sm text-gray-500">{subtitle}</p>
            : <>{subtitle}</>
        )}
      </div>
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </button>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
