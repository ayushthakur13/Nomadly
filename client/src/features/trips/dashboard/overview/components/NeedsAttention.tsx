import Icon from '@/components/icon/Icon';
import { useNavigate } from 'react-router-dom';
import type { AttentionItem } from '../hooks/useNeedsAttention';

interface NeedsAttentionProps {
  items: AttentionItem[];
}

const NeedsAttention = ({ items }: NeedsAttentionProps) => {
  const navigate = useNavigate();

  // Empty state: show reassuring message
  if (!items.length) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-700">Everything looks on track.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
      {/* Section header: subtle, not alarming */}
      <div className="flex items-start gap-2 mb-4">
        <div className="p-1.5 rounded-md bg-amber-50 flex-shrink-0">
          <Icon name="alertCircle" className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Needs Attention</p>
          <p className="text-xs text-gray-500 mt-0.5">Quick actions to unblock progress</p>
        </div>
      </div>

      {/* Items: subtle dividers, not full cards */}
      <div className="space-y-0 divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between py-3 first:pt-0">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Muted icon */}
              <div className="p-1.5 rounded-md bg-gray-100 flex-shrink-0">
                <Icon name={item.icon as any} size={16} className="text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Title: strong */}
                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                {/* Description: lighter, smaller */}
                <p className="text-xs text-gray-500 mt-0.5">{item.why}</p>
              </div>
            </div>
            {/* CTA: invitation, not command */}
            <button
              type="button"
              onClick={() => navigate(item.href)}
              className="text-xs font-semibold text-emerald-700 flex items-center gap-0.5 ml-3 flex-shrink-0"
            >
              {item.cta} <Icon name="arrowRight" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NeedsAttention;
