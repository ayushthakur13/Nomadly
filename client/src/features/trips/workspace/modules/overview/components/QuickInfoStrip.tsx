import Icon from '@/ui/icon/Icon';
import type { QuickInfoItem } from '../hooks/useQuickInfo';

interface QuickInfoStripProps {
  items: QuickInfoItem[];
}

const QuickInfoStrip = ({ items }: QuickInfoStripProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${item.accentBg}`}>
              <Icon name={item.icon as any} size={18} className={item.accentIcon} />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{item.label}</p>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-semibold text-gray-900`}>{item.value}</span>
                {item.suffix && <span className="text-base">{item.suffix}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickInfoStrip;
