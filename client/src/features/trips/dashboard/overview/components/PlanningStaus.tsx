import type { PlanningRow, PlanningStatus } from '../hooks/usePlanningStatus';

interface PlanningStatusProps {
  rows: PlanningRow[];
}

const statusClass = (s: PlanningStatus) => {
  switch (s) {
    case 'Not started':
      return 'text-gray-400';
    case 'Started':
    case 'In progress':
      return 'text-emerald-600';
    case 'Set':
    case 'Added':
      return 'text-emerald-600';
    default:
      return 'text-gray-500';
  }
};

const PlanningStatus = ({ rows }: PlanningStatusProps) => {
  // Split rows into core planning vs logistics
  const corePlanning = rows.slice(0, 2); // Destinations, Tasks
  const logistics = rows.slice(2); // Budget, Stay

  return (
    <div className="mb-6 px-3">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-600 mb-0.5">Planning status</p>
        <p className="text-[11px] text-gray-500">A quick look at what's been planned so far</p>
      </div>
      <div>
        {/* Core planning group */}
        <div className="divide-y divide-gray-50">
          {corePlanning.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700">{row.label}</span>
              <span className={`text-xs ${statusClass(row.status)}`}>{row.status}</span>
            </div>
          ))}
        </div>
        {/* Subtle gap for visual hierarchy */}
        <div className="h-2" />
        {/* Logistics group */}
        <div className="divide-y divide-gray-50">
          {logistics.map((row) => (
            <div key={row.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700">{row.label}</span>
              <span className={`text-xs ${statusClass(row.status)}`}>{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningStatus;
