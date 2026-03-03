import { useState } from 'react';
import type { BudgetSnapshot } from '@shared/types';
import { Icon } from '@/ui/icon';
import { InfoModal } from '@/ui/common';
import { useMemberDetails } from '../hooks';
import { formatCurrency } from '../utils/formatting';

interface InsightPill {
  key: string;
  label: string;
  color: string;
  icon: 'checkCircle' | 'alertTriangle' | 'alertCircle' | 'dollarSign';
}

interface BudgetInsightsProps {
  snapshot: BudgetSnapshot;
}

const MAX_VISIBLE = 4;

const BudgetInsights = ({ snapshot }: BudgetInsightsProps) => {
  const { getMemberName } = useMemberDetails();
  const { summary, expenses, memberSummaries } = snapshot;
  const currency = snapshot.budget?.baseCurrency || 'INR';
  const [showOverlay, setShowOverlay] = useState(false);

  // --- Build ordered pill list ---
  const pills: InsightPill[] = [];

  // 1. Utilization
  const hasPlanned = summary.totalPlanned > 0;
  const utilizationPct = hasPlanned
    ? Math.round((summary.totalSpent / summary.totalPlanned) * 100)
    : null;

  if (utilizationPct !== null) {
    if (summary.remaining < 0) {
      pills.push({ key: 'util', label: `Over budget by ${formatCurrency(Math.abs(summary.remaining), currency)}`, color: 'text-red-700 bg-red-50 border-red-200', icon: 'alertCircle' });
    } else if (utilizationPct >= 90) {
      pills.push({ key: 'util', label: `${utilizationPct}% spent — almost at limit`, color: 'text-orange-700 bg-orange-50 border-orange-200', icon: 'alertTriangle' });
    } else if (utilizationPct >= 75) {
      pills.push({ key: 'util', label: `${utilizationPct}% spent — heads up`, color: 'text-amber-700 bg-amber-50 border-amber-200', icon: 'alertTriangle' });
    } else {
      pills.push({ key: 'util', label: `${utilizationPct}% spent — on track`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: 'checkCircle' });
    }
  }

  // 2. Top category
  const categoryTotals: Record<string, number> = {};
  for (const exp of expenses ?? []) {
    const key = exp.category && exp.category !== 'Other' ? exp.category : 'Other';
    categoryTotals[key] = (categoryTotals[key] || 0) + exp.amount;
  }
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    pills.push({ key: 'top-cat', label: `Top spend: ${topCategory[0]} (${formatCurrency(topCategory[1], currency)})`, color: 'text-blue-700 bg-blue-50 border-blue-200', icon: 'dollarSign' });
  }

  // 3. Over-budget members
  memberSummaries
    .filter((m) => m.remaining < 0)
    .forEach((m) => {
      pills.push({ key: `over-${m.userId}`, label: `${getMemberName(m.userId)} is ${formatCurrency(Math.abs(m.remaining), currency)} over`, color: 'text-red-700 bg-red-50 border-red-200', icon: 'alertTriangle' });
    });

  if (pills.length === 0) return null;

  const visiblePills = pills.slice(0, MAX_VISIBLE);
  const hiddenCount = pills.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-2">
      {visiblePills.map((pill) => (
        <div
          key={pill.key}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap ${pill.color}`}
        >
          <Icon name={pill.icon} size={13} />
          {pill.label}
        </div>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setShowOverlay(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
        >
          +{hiddenCount} more
        </button>
      )}

      <InfoModal
        isOpen={showOverlay}
        title="All insights"
        onClose={() => setShowOverlay(false)}
      >
        <ul className="space-y-2.5">
          {pills.map((pill) => (
            <li
              key={pill.key}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${pill.color}`}
            >
              <Icon name={pill.icon} size={15} />
              {pill.label}
            </li>
          ))}
        </ul>
      </InfoModal>
    </div>
  );
};

export default BudgetInsights;
