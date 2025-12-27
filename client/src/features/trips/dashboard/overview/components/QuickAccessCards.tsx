import Icon from '@/components/icon/Icon';
import { useNavigate } from 'react-router-dom';
import type { QuickCard } from '../hooks/useQuickAccessCards';

interface QuickAccessCardsProps {
  cards: QuickCard[];
}

const Card = ({ icon, title, hint, href }: { icon: string; title: string; hint?: string; href: string }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="rounded-md bg-gray-50 p-3 text-left hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-sm bg-white">
          <Icon name={icon as any} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {hint && <p className="text-xs text-gray-600">{hint}</p>}
        </div>
      </div>
    </button>
  );
};

const QuickAccessCards = ({ cards }: QuickAccessCardsProps) => {
  const visible = cards.slice(0, 2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {visible.map((c, idx) => (
        <Card key={idx} icon={c.icon} title={c.title} hint={c.hint} href={c.href} />
      ))}
    </div>
  );
};

export default QuickAccessCards;
